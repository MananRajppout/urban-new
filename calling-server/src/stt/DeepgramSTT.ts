import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { STT, STTConfig, STTResult } from "./STT.js";
import env from "../config/env.js";

export class DeepgramSTT extends STT {
  private deepgram: any;
  private connection: any;
  private connectionPromise: Promise<void> | null = null;
  private audioStartTime = 0;
  private lastTranscriptTime = 0;
  private lastAudioSendTime = 0;

  constructor(config: STTConfig = {}) {
    super({
      model: "nova-3",
      ...config,
    });
    this.deepgram = createClient(env.DEEPGRAM_API_KEY);
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      // console.log("Deepgram already connected");
      return;
    }

    if (this.connectionPromise) {
      // console.log("Connection already in progress");
      return this.connectionPromise;
    }

    // console.log("Creating new Deepgram connection promise");
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        // console.log("Initializing Deepgram connection...");
        this.connection = this.deepgram.listen.live({
          model: "nova-3",
          language: this.config.language || "en-US",
          smart_format: true,
          encoding: "linear16",
          sample_rate: 16000,
          channels: 1,
          interim_results: true,
        });

        // console.log("Setting up Deepgram event listeners");

        this.connection.on(LiveTranscriptionEvents.Open, () => {
          // console.log("🟢 Deepgram connection opened successfully");
          this.isConnected = true;
          resolve();
        });

        this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
          // console.log("📝 Deepgram transcript received:", JSON.stringify(data));
          const currentTime = performance.now();

          // console.log(data?.channel?.alternatives[0]);
          if (data?.channel?.alternatives[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            console.log("✅ Transcribed text:", transcript);

            // Calculate and log latency metrics
            if (this.lastAudioSendTime > 0) {
              // console.log(
              //   `📊 LATENCY - Deepgram Processing Time: ${(
              //     currentTime - this.lastAudioSendTime
              //   ).toFixed(2)}ms`
              // );
            }

            if (this.lastTranscriptTime > 0) {
              // (
              //   `📊 LATENCY - Time between transcripts: ${(
              //     currentTime - this.lastTranscriptTime
              //   ).toFixed(2)}ms`
              // );
            }
            this.lastTranscriptTime = currentTime;

            const result: STTResult = {
              transcript,
              confidence: data.channel.alternatives[0].confidence || 0,
              isFinal: !!data.is_final,
            };

            // Only emit final transcripts
            if (result.isFinal) {
              // console.log("🔈 Emitting final transcript:", result.transcript);
              this.emit("transcript", result);
            } else {
              // console.log("🔇 Ignoring partial transcript:", result.transcript);
            }
          } else {
            // console.log(
            //   "⚠️ Received transcript event with no usable transcript"
            // );
          }
        });

        this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
          console.error("🔴 Deepgram Error:", error);
          const sttError = new Error(
            error.message || "Deepgram transcription error"
          );
          this.emit("error", sttError);

          if (!this.isConnected) {
            reject(sttError);
          }
        });

        this.connection.on(LiveTranscriptionEvents.Close, () => {
          // console.log("🔵 Deepgram connection closed");
          this.isConnected = false;
          this.connectionPromise = null;
        });

        // Add additional event listeners for more insights
        this.connection.on(
          LiveTranscriptionEvents.Metadata,
          (metadata: any) => {
            // console.log("ℹ️ Deepgram metadata:", metadata);
          }
        );

        // console.log("✅ Deepgram event listeners set up successfully");

        // Set a timeout to reject if connection doesn't open within 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            const timeoutError = new Error("Deepgram connection timed out");
            console.error("⏱️ " + timeoutError.message);
            reject(timeoutError);
          }
        }, 10000);
      } catch (error) {
        console.error("❌ Error setting up Deepgram connection:", error);
        reject(error);
      }
    });

    try {
      await this.connectionPromise;
      // console.log("✅ Deepgram connection established and ready for audio");
    } catch (error) {
      console.error("❌ Failed to establish Deepgram connection:", error);
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      // console.log("Deepgram already disconnected");
      return;
    }

    // console.log("Disconnecting Deepgram...");
    if (this.connection) {
      try {
        await this.connection.finish();
        // console.log("Deepgram disconnected successfully");
      } catch (error) {
        console.error("Error disconnecting from Deepgram:", error);
      }
    }

    this.isConnected = false;
    this.connectionPromise = null;
  }

  async send(audioData: Blob): Promise<void> {
    if (!this.isConnected) {
      // console.log("Deepgram not connected, attempting to connect...");
      await this.connect();
    }

    try {
      // Log the audio data details
      const currentTime = performance.now();
      this.lastAudioSendTime = currentTime;

      if (this.audioStartTime === 0) {
        this.audioStartTime = currentTime;
        // console.log("🎙️ First audio data sent to Deepgram");
      } else {
        // console.log(
        //   `📊 LATENCY - Time since first audio: ${(
        //     currentTime - this.audioStartTime
        //   ).toFixed(2)}ms`
        // );
      }

      // console.log("🎤 Preparing to send audio to Deepgram:", {
      //   type: audioData.type,
      //   size: audioData.size,
      // });

      if (!this.connection) {
        throw new Error("No Deepgram connection available");
      }

      // Convert Blob to ArrayBuffer
      // console.log("Converting Blob to ArrayBuffer...");
      const arrayBuffer = await audioData.arrayBuffer();
      // console.log("ArrayBuffer size:", arrayBuffer.byteLength);

      // Convert ArrayBuffer to Uint8Array
      const audioBytes = new Uint8Array(arrayBuffer);

      // console.log("📤 Sending audio data to Deepgram...");

      // Send as raw bytes instead of Blob
      this.connection.send(audioBytes);

      // console.log("✅ Audio data sent to Deepgram");
    } catch (error) {
      console.error("❌ Error sending audio to Deepgram:", error);
      const sttError =
        error instanceof Error
          ? error
          : new Error("Error sending audio to Deepgram");
      this.emit("error", sttError);
      throw sttError;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

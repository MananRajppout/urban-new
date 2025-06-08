import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";
import { STT, STTConfig, STTResult } from "./STT.js";
import env from "../config/env.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GroqSTT extends STT {
  private client: Groq;
  private tmpDir: string;
  private audioBuffer: Array<Uint8Array> = [];
  private processingTimeout: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private lastDebugTranscript: number | null = null;

  constructor(config: STTConfig = {}) {
    super({
      model: "whisper-large-v3",
      language: "en",
      ...config,
    });

    // Check for API key presence
    if (!env.GROK_API_KEY) {
      console.error(
        "❌ CRITICAL ERROR: GROK_API_KEY environment variable is not set!"
      );
      console.error(
        "Please set the GROK_API_KEY in your environment variables."
      );
    }

    this.client = new Groq({
      apiKey: env.GROK_API_KEY || "",
    });

    // Log that we found the key (partially masked for security)
    const apiKey = env.GROK_API_KEY || "";
    if (apiKey) {
      const maskedKey = apiKey.slice(0, 4) + "..." + apiKey.slice(-4);
      console.log(`Using Groq API key: ${maskedKey}`);
    } else {
      console.error("No Groq API key found in environment variables!");
    }

    // Create temp directory for audio files
    this.tmpDir = path.join(os.tmpdir(), "groq-stt");
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }

    console.log(`GroqSTT initialized with language: ${this.config.language}`);
    console.log(`Temporary directory: ${this.tmpDir}`);
  }

  async connect(): Promise<void> {
    console.log("Initializing Groq STT service");
    this.isConnected = true;

    // Test the API key and connection
    try {
      // Simple test request to verify API key works
      const testResponse = await this.client.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "user",
            content:
              "Test connection - respond with 'Groq API connection successful'",
          },
        ],
        max_tokens: 10,
      });

      console.log(
        "✅ Groq API connection test successful:",
        testResponse.choices[0].message.content
      );
    } catch (error: any) {
      console.error("❌ Groq API connection test failed:", error.message);
      console.error(
        "This suggests an issue with your API key or network connection"
      );
      this.emit(
        "error",
        new Error(`Groq API connection failed: ${error.message}`)
      );
    }

    console.log("Groq STT service initialized");
  }

  async disconnect(): Promise<void> {
    console.log("Disconnecting from Groq STT service");
    this.isConnected = false;

    // Clear any pending processing
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }

    // Clear buffer
    this.audioBuffer = [];

    console.log("Disconnected from Groq STT service");
  }

  /**
   * Create a properly formatted WAV file from raw audio data
   */
  private createWavFile(audioBuffer: Buffer, outputPath: string): void {
    // Create a WAV header (44 bytes)
    const wavHeader = Buffer.alloc(44);

    // "RIFF" chunk descriptor
    wavHeader.write("RIFF", 0);
    // Total file size - 8
    wavHeader.writeUInt32LE(36 + audioBuffer.length, 4);
    // "WAVE" format
    wavHeader.write("WAVE", 8);

    // "fmt " sub-chunk
    wavHeader.write("fmt ", 12);
    // Sub-chunk size (16 for PCM)
    wavHeader.writeUInt32LE(16, 16);
    // Audio format (1 for PCM)
    wavHeader.writeUInt16LE(1, 20);
    // Number of channels (1 for mono)
    wavHeader.writeUInt16LE(1, 22);
    // Sample rate (16000 Hz)
    wavHeader.writeUInt32LE(16000, 24);
    // Byte rate (16000 * 2)
    wavHeader.writeUInt32LE(16000 * 2, 28);
    // Block align
    wavHeader.writeUInt16LE(2, 32);
    // Bits per sample (16)
    wavHeader.writeUInt16LE(16, 34);

    // "data" sub-chunk
    wavHeader.write("data", 36);
    // Data size
    wavHeader.writeUInt32LE(audioBuffer.length, 40);

    // Write the WAV file (header + audio data)
    const fd = fs.openSync(outputPath, "w");
    fs.writeSync(fd, wavHeader, 0, 44, 0);
    fs.writeSync(fd, audioBuffer, 0, audioBuffer.length, 44);
    fs.closeSync(fd);

    console.log(
      `Created WAV file: ${outputPath} (${fs.statSync(outputPath).size} bytes)`
    );
  }

  async send(audioData: Blob): Promise<void> {
    if (!this.isConnected) {
      console.log("Groq STT not connected, connecting...");
      await this.connect();
    }

    try {
      // Keep test transcripts for debugging
      const now = new Date().getTime();
      if (!this.lastDebugTranscript || now - this.lastDebugTranscript > 10000) {
        console.log("\n\n");
        console.log("🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵");
        console.log("🔊 TEST TRANSCRIPT - While processing real audio");
        console.log("🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵");
        console.log("\n\n");

        const testResult: STTResult = {
          transcript:
            "This is a test transcript alongside real audio processing.",
          confidence: 1.0,
          isFinal: true,
        };

        this.lastDebugTranscript = now;
        this.emit("transcript", testResult);
        console.log("🎯 Test transcript emitted at", new Date().toISOString());
      }

      // RESTORE REAL AUDIO PROCESSING alongside test transcripts

      // Verify the blob has the right format
      console.log(
        `Received audio blob: size=${audioData.size}, type=${audioData.type}`
      );

      // Convert the incoming audio to WAV format that Groq can accept
      const arrayBuffer = await audioData.arrayBuffer();
      const audioUint8Array = new Uint8Array(arrayBuffer);

      // Check if we have sufficient audio data
      if (audioUint8Array.length < 1000) {
        console.log("Audio data too small, skipping");
        return;
      }

      // Create a basic analysis of the audio data to check for speech
      let hasSound = false;
      let maxAmplitude = 0;
      for (let i = 0; i < Math.min(audioUint8Array.length, 1000); i++) {
        const value = audioUint8Array[i];
        // Check if value is significantly different from center (128)
        const amplitude = Math.abs(value - 128);
        maxAmplitude = Math.max(maxAmplitude, amplitude);
        if (amplitude > 20) {
          // Arbitrary threshold
          hasSound = true;
        }
      }

      console.log(
        `Audio analysis: maxAmplitude=${maxAmplitude}, hasSound=${hasSound}`
      );

      // Add to buffer
      this.audioBuffer.push(audioUint8Array);
      console.log(
        `Added audio chunk to buffer. Total chunks: ${this.audioBuffer.length}`
      );

      // Reset the processing timeout to wait for more audio chunks
      if (this.processingTimeout) {
        clearTimeout(this.processingTimeout);
        console.log("Cleared previous processing timeout.");
      }

      // Process after a short delay if no more audio chunks arrive
      console.log("Scheduling processing of audio buffer in 100ms...");
      this.processingTimeout = setTimeout(() => {
        console.log("Timeout triggered. Initiating audio buffer processing...");
        this.processAudioBuffer();
      }, 100);
    } catch (error) {
      console.error("❌ Error processing audio data:", error);
      const err =
        error instanceof Error
          ? error
          : new Error("Unknown error buffering audio");
      this.emit("error", err);
    }
  }

  private async processAudioBuffer(): Promise<void> {
    console.log(
      `Processing audio buffer with ${this.audioBuffer.length} chunks. isProcessing=${this.isProcessing}`
    );

    if (this.isProcessing || this.audioBuffer.length === 0) {
      console.log("Skipping processing: already processing or empty buffer");
      return;
    }

    this.isProcessing = true;
    const processingStartTime = performance.now();
    console.log("🎙️ STARTING AUDIO PROCESSING");
    let tempFilePath = "";

    try {
      // Combine all chunks
      const totalLength = this.audioBuffer.reduce(
        (acc, chunk) => acc + chunk.length,
        0
      );
      console.log(`Total audio buffer length: ${totalLength} bytes`);

      const combinedBuffer = Buffer.alloc(totalLength);

      let offset = 0;
      this.audioBuffer.forEach((chunk) => {
        combinedBuffer.set(chunk, offset);
        offset += chunk.length;
      });

      // Log some data about the buffer for debugging
      console.log(
        `First 20 bytes of audio data: ${combinedBuffer
          .slice(0, 20)
          .toString("hex")}`
      );

      // Clear buffer immediately to allow new audio data to be processed
      const bufferClearTime = performance.now();
      console.log(
        `📊 LATENCY - Audio Buffer Processing Time: ${(
          bufferClearTime - processingStartTime
        ).toFixed(2)}ms`
      );

      // Analyze audio for sound
      let hasSound = false;
      let maxAmplitude = 0;
      let sumAmplitude = 0;

      // Sample the audio to analyze volume
      const sampleSize = Math.min(5000, combinedBuffer.length);
      const sampleInterval = Math.max(
        1,
        Math.floor(combinedBuffer.length / sampleSize)
      );

      for (let i = 0; i < combinedBuffer.length; i += sampleInterval) {
        const value = combinedBuffer[i];
        // Sound values should deviate from 128 (PCM center) or near zero
        const amplitude = Math.abs(value > 128 ? value - 128 : value);
        maxAmplitude = Math.max(maxAmplitude, amplitude);
        sumAmplitude += amplitude;
      }

      const avgAmplitude =
        sumAmplitude / (combinedBuffer.length / sampleInterval);
      hasSound = maxAmplitude > 30; // Arbitrary threshold

      console.log(
        `Audio analysis: maxAmplitude=${maxAmplitude}, avgAmplitude=${avgAmplitude.toFixed(
          2
        )}, hasSound=${hasSound}`
      );

      // Clear buffer
      this.audioBuffer = [];
      console.log("Audio buffer cleared after combining chunks");

      console.log(`Processing combined audio data (${totalLength} bytes)`);

      // Skip if too small or no sound detected
      if (totalLength < 1000) {
        console.warn("⚠️ Audio buffer too small, skipping transcription");
        this.isProcessing = false;
        return;
      }

      if (!hasSound) {
        console.warn(
          "⚠️ No significant sound detected in audio, skipping transcription"
        );
        this.isProcessing = false;
        return;
      }

      // NORMALIZE AUDIO: If audio is very quiet, amplify it
      if (maxAmplitude < 50 && maxAmplitude > 0) {
        console.log(
          `Audio is quiet (max amplitude ${maxAmplitude}), amplifying...`
        );
        const amplificationFactor = Math.min(5, 50 / maxAmplitude);
        console.log(`Using amplification factor: ${amplificationFactor}`);

        // Apply gain to boost very quiet audio
        for (let i = 0; i < combinedBuffer.length; i++) {
          // Center around 128
          const centered = combinedBuffer[i] - 128;
          // Apply gain
          const amplified = centered * amplificationFactor;
          // Add back center and clamp to valid PCM range
          combinedBuffer[i] = Math.max(
            0,
            Math.min(255, Math.round(amplified + 128))
          );
        }

        console.log("Audio amplification complete");
      }

      // Create WAV file
      const id = uuidv4();
      tempFilePath = path.join(this.tmpDir, `${id}.wav`);
      console.log(`Creating WAV file at ${tempFilePath}`);
      this.createWavFile(combinedBuffer, tempFilePath);

      // Verify the file exists and has content
      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`Failed to create WAV file at ${tempFilePath}`);
      }

      const fileSize = fs.statSync(tempFilePath).size;
      console.log(`WAV file created with size: ${fileSize} bytes`);

      if (fileSize < 44) {
        // 44 bytes is the WAV header size
        throw new Error(
          `WAV file is too small (${fileSize} bytes). Header only, no audio data.`
        );
      }

      // Send to Groq API
      const fileStream = fs.createReadStream(tempFilePath);
      console.log(
        `Sending audio file to Groq (${fs.statSync(tempFilePath).size} bytes)`
      );

      console.log("Calling Groq API with transcription request...");
      console.log(`Using model: ${this.config.model || "whisper-large-v3"}`);
      console.log(
        `Using language: ${this.config.language?.split("-")[0] || "en"}`
      );

      try {
        const response = await this.client.audio.transcriptions.create({
          model: this.config.model || "whisper-large-v3",
          file: fileStream,
          language: this.config.language?.split("-")[0] || "en",
        });

        console.log("✅ Received transcription from Groq:", response);

        if (response && response.text && response.text.trim() !== "") {
          const transcriptGenTime = performance.now();
          console.log(
            `📊 LATENCY - Groq Transcription API Time: ${(
              transcriptGenTime - processingStartTime
            ).toFixed(2)}ms`
          );

          const result: STTResult = {
            transcript: response.text.trim(),
            confidence: 1.0,
            isFinal: true,
          };

          // Add more visible logging for the transcript
          console.log("\n");
          console.log(
            "****************************************************************************"
          );
          console.log(
            "*                         FINAL TRANSCRIPTION DETECTED                     *"
          );
          console.log(
            "****************************************************************************"
          );
          console.log('📢 FINAL TRANSCRIPT: "' + result.transcript + '"');
          console.log(
            "****************************************************************************"
          );
          console.log("\n");

          // Log the transcript emission
          console.log("📝 Emitting final transcription result:", result);

          this.emit("transcript", result);
          console.log("📝 Transcription event emitted");
        } else {
          console.log(
            "⚠️ Empty transcription result, audio may not contain speech"
          );
        }
      } catch (apiError: any) {
        console.error("❌ Groq API Error:", apiError);
        // Check for specific error types
        if (apiError.status === 401) {
          console.error("🔑 AUTHENTICATION ERROR: Invalid Groq API key");
        } else if (apiError.status === 400) {
          console.error("🔴 BAD REQUEST: The audio file format may be invalid");
          // Save a copy of the problematic file for debugging
          const debugFilePath = path.join(this.tmpDir, `debug_${id}.wav`);
          fs.copyFileSync(tempFilePath, debugFilePath);
          console.error(
            `Saved problematic audio file to ${debugFilePath} for debugging`
          );
        } else {
          console.error(
            `🔴 ERROR ${apiError.status || "unknown"}: ${apiError.message}`
          );
        }
      }
    } catch (error) {
      console.error("❌ Groq STT Error:", error);

      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        this.emit("error", error);
      } else {
        this.emit("error", new Error("Unknown error in Groq transcription"));
      }
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          console.log(`Temporary file deleted: ${tempFilePath}`);
        } catch (e) {
          console.error(`Error cleaning up file ${tempFilePath}:`, e);
        }
      }
      console.log("Audio processing complete. Setting isProcessing=false");
      this.isProcessing = false;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

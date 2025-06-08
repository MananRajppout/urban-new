import { CallConfig } from "../CallHandler.js";
import env from "../config/env.js";
import TTS from "./TTS.js";
import WebSocket from "ws";

export default class ElevenLabTTS extends TTS {
  protected socket?: WebSocket;
  private textBuffer = "";
  private sendTextTime = 0;
  private firstAudioChunk = true;
  private totalAudioBytes = 0;
  private audioChunksReceived = 0;

  constructor(public callConfig: CallConfig) {
    super();
    this.name = "ElevenLabTTS";
  }
  override async connect() {
    const elevenLabConfigs = this.callConfig.elevenLab;
    // const apiKey = this.callConfig.agent.elevenlabs_api_key || env.ELEVENLABS_API_KEY
    const apiKey = this.callConfig.agent.elevenlabs_api_key;
    const url = `wss://api.elevenlabs.io/v1/text-to-speech/${elevenLabConfigs.voiceId}/stream-input?model_id=${elevenLabConfigs.model}&output_format=${elevenLabConfigs.outputFormat}&inactivity_timeout=60`;
    // make websocket connection
    this.socket = new WebSocket(url, {
      headers: { "xi-api-key": `${apiKey}` },
    });
    // add message event listener
    this.socket.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { audio, text, message: msg, error, ...other } = data;
        // console.log("ElevenLabSocket", text,error,other);
        // console.log("ElevenLab -> ",data)
        if (audio) {
          this.audioChunksReceived++;
          this.totalAudioBytes += audio.length;

          if (this.callConfig.time.flags.isTTSFirstDelta) {
            this.callConfig.time.tts = performance.now();
            this.callConfig.time.flags.isTTSFirstDelta = false;
          }

          if (this.firstAudioChunk && this.sendTextTime > 0) {
            const latency = performance.now() - this.sendTextTime;
            console.log(
              `📊 LATENCY - TTS First Audio Chunk: ${latency.toFixed(2)}ms`
            );
            console.log(
              `📊 LATENCY - Total Pipeline (Input to First Audio): ${(
                performance.now() - this.callConfig.time.input
              ).toFixed(2)}ms`
            );
            this.firstAudioChunk = false;
          }

          this.emit("audio", audio);
        }
        if (error) {
          console.error(this.name, error);
        }
      } catch (error) {
        console.error(this.name, error);
      }
    });

    this.socket.on("close", () => {
      console.log("ElevenLabTTS", "socket closed");
      this.close();
      this.emit("close", null);
    });

    this.socket.on("error", (error) => {
      console.error(this.name, error);
    });

    //  wait for open event
    await new Promise<void>((resolve) => {
      this.socket!.on("open", () => {
        this.onOpen();
        console.log("ElevenLabTTS", "socket is connected");
        resolve();
      });
    });
  }
  override close() {
    if (this.audioChunksReceived > 0) {
      console.log(
        `📊 LATENCY - TTS Performance: ${this.audioChunksReceived} chunks, ${this.totalAudioBytes} bytes total`
      );
    }
    this.socket?.close();
  }
  override sendDelta(delta: string, isFinal?: boolean): void {
    this.textBuffer += delta;
    if (this.sendTextTime === 0) {
      this.sendTextTime = performance.now();
      console.log(
        `📊 LATENCY - TTS Text First Chunk Sent: ${(
          this.sendTextTime - this.callConfig.time.llm
        ).toFixed(2)}ms after LLM first token`
      );
    }

    if (isFinal) {
      console.log(
        `📊 LATENCY - TTS Total Text Received: ${this.textBuffer.length} chars`
      );
      this.textBuffer = "";
      this.sendTextTime = 0;
      this.firstAudioChunk = true;
    }

    this.sendMessage({ text: delta, flush: isFinal });
  }
  override sendText(text: string): void {
    this.sendMessage({ text, flush: true });
  }
  private sendMessage(message: any) {
    this.socket?.send(JSON.stringify(message));
  }
  private sendSettings() {
    this.sendMessage({
      text: " ",
      voice_settings: {
        stability: this.callConfig.agent.ambient_stability,
        similarity_boost: this.callConfig.agent.ambient_similarity,
        use_speaker_boost: false,
        speed: this.callConfig.agent.voice_speed,
      },
      generation_config: { chunk_length_schedule: [50, 60, 100, 120] },
    });
  }
  protected onOpen(): void {
    this.sendSettings();
  }
}

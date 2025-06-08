import { CallConfig } from "../CallHandler.js";
import { BasicSocket, SocketArgs, SocketEventMap } from "./BasicSocket.js";
interface ElevenLabEventMap extends SocketEventMap {
  Audio: { audio: string };
}
 
export class ElevenLabSocket extends BasicSocket<ElevenLabEventMap> {
  //=====================add voice settings args here by aayush===============================
  private speed: number;
  private ambient_stability: number;
  private ambient_similarity: number;
 
  constructor(args: SocketArgs, protected callConfig: CallConfig) {
    super(args);
    this.name = "ElevenLabSocket";
    this.speed = this.callConfig.agent.voice_speed;
    this.ambient_stability = this.callConfig.agent.ambient_stability;
    this.ambient_similarity = this.callConfig.agent.ambient_similarity;
  }
  protected onOpen(): void {
    this.sendSettings();
  }
  protected onMessage(message: any): void {
    try {
      const data = JSON.parse(message.toString());
      const { audio, text, message: msg, error, ...other } = data;
      console.log("ElevenLabSocket", text, error, other);
      if (audio) {
        this.dispatchEvent("Audio", { audio });
      }
      if (error) {
        console.error(this.name, error);
      }
    } catch (error) {
      console.error(this.name, error);
    }
  }
  public sendText(text: string, flush?: boolean) {
    this.send(JSON.stringify({ text, flush }));
  }
  //update voice setting by aayush
  public sendSettings(
    settings: {
      stability?: number;
      similarity_boost?: number;
      use_speaker_boost?: boolean;
      speed: number;
    } = {
      stability: this.ambient_stability,
      similarity_boost: this.ambient_similarity,
      use_speaker_boost: false,
      speed: this.speed,
    }
  ) {
    this.send(
      JSON.stringify({
        text: " ",
        voice_settings: settings,
        generation_config: { chunk_length_schedule: [120, 160, 250, 290] },
      })
    );
  }
}
 
 
import { BasicSocket, SocketArgs, SocketEventMap } from "./BasicSocket.js";
import WebSocket from "ws";
export interface VoiceEventMap extends SocketEventMap {
  Media: { audio: string };
  Start: { contentType: string; rate: number };
  // PlayAudio: { audio: string; contentType: string; rate: number };
  CheckPoint: { name: string };
}

export abstract class VoiceSocket<
  T extends VoiceEventMap = VoiceEventMap
> extends BasicSocket<T> {
  constructor(args: SocketArgs) {
    super(args);
    this.name = "AudioSocket";
  }
  protected abstract onMessage(message: any): void;
  protected onAudio(audio: string) {}
  abstract sendAudio(
    audio: string,
    configs?: {
      checkPoint?: {
        name: string;
      };
      contentType?: string;
      rate?: number;
    }
  ): void;

  abstract clearAudio(): void;
  abstract sendCheckPoint(name: string): void;
}

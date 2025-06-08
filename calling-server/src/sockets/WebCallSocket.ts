import { BasicSocket, SocketArgs, SocketEventMap } from "./BasicSocket.js";
import WebSocket from "ws";
import { VoiceSocket, VoiceEventMap } from "./VoiceSocket.js";
interface WebCallEventMap extends VoiceEventMap {
  Media: { audio: string };
  Start: { streamId: string; contentType: string; rate: number };
  CheckPoint: { name: string };
}
export class WebCallSocket extends VoiceSocket<WebCallEventMap> {
  streamId: string = "";
  constructor(args: SocketArgs) {
    super(args);
    this.name = "WebCallSocket";
  }
  protected onMessage(message: any): void {
    try {
      const data = JSON.parse(message.toString());
      switch (data.event) {
        case "media":
          this.dispatchEvent("Media", { audio: data.media.payload });
          break;
        case "start":
          this.streamId = data.start.streamId;
          console.log("WebCallSocket", data, this.streamId);
          this.dispatchEvent("Start", {
            streamId: this.streamId,

            contentType: "",
            rate: 0,
          });
          break;
        case "playedStream":
          this.dispatchEvent("CheckPoint", { name: data.name });
          if (data.name === "endCall") {
            this.close();
          }
          break;
      }
    } catch (error) {
      console.error(this.name, error);
    }
  }
  sendAudio(
    audio: string,
    configs?: {
      checkPoint?: {
        name: string;
      };
      contentType?: string;
      rate?: number;
    }
  ) {
    this.send(
      JSON.stringify({
        event: "playAudio",
        streamId: this.streamId,
        media: {
          contentType: configs?.contentType || "audio/x-mulaw",
          sampleRate: configs?.rate || 8000,
          payload: audio,
        },
      })
    );
    if (configs?.checkPoint) {
      this.sendCheckPoint(configs.checkPoint.name);
    }
  }
  clearAudio() {
    this.send(
      JSON.stringify({
        event: "clearAudio",
        streamId: this.streamId,
      })
    );
  }
  sendCheckPoint(name: string) {
    this.send(
      JSON.stringify({
        event: "checkpoint",
        streamId: this.streamId,
        name,
      })
    );
  }
}

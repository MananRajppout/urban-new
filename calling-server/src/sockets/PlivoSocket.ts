import { BasicSocket, SocketArgs, SocketEventMap } from "./BasicSocket.js";
import WebSocket from "ws";
import { VoiceSocket, VoiceEventMap } from "./VoiceSocket.js";

import { CallConfig } from "../CallHandler.js";
import serverApi from "../utils/serverApi.js";

interface PlivoEventMap extends VoiceEventMap {
  Media: { audio: string };
  Start: { streamId: string; contentType: string; rate: number };
  CheckPoint: { name: string };
}


export class PlivoSocket extends VoiceSocket<PlivoEventMap> {
  streamId: string = "";

  constructor(args: SocketArgs, protected callConfig: CallConfig) {
    super(args);

    this.name = "PlivoSocket";
  }

  protected async onMessage(message: any): Promise<void> {
    try {
      const data = JSON.parse(message);
      switch (data.event) {
        case "media":
          this.dispatchEvent("Media", { audio: data.media.payload });
          break;
        case "start":
          this.streamId = data.start.streamId;
          console.log("PlivoSocket start", data);
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
        media: {
          contentType: configs?.contentType || "audio/x-l16",
          sampleRate: configs?.rate || 16000,
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
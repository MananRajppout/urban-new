import WebSocket from "ws";
import { EventEmitter, EventTypes } from "../EventEmitter.js";
import { CalendarTool } from "../models/agent.model.js";
import { analyzeCall } from "../utils.js";
import { CallConfig } from "../CallHandler.js";
import serverApi from "../utils/serverApi.js";

export interface SocketEventMap extends EventTypes {
  close: {};
  open: {};
}

export type SocketArgs = { url?: string; configs?: any; ws?: WebSocket };

export class BasicSocket<
  T extends SocketEventMap = SocketEventMap
> extends EventEmitter<T> {
  protected socket: WebSocket;
  public name = "BasicSocket";
  private messageQueue: any[] = [];
  protected callConfig?: CallConfig;

  constructor(args: SocketArgs) {
    super();
    if (!args.url && !args.ws) {
      throw new Error("URL or WebSocket instance must be provided");
    }
    this.socket = args.ws || new WebSocket(args.url!, args.configs);
    // Initialize callConfig from args if available
    if ("callConfig" in args) {
      this.callConfig = (args as any).callConfig;
    }
    this.init();
  }

  protected init() {
    const time = performance.now();
    this.socket.on("message", (message) => {
      this.onMessage(message);
    });
    this.socket.on("open", () => {
      // console.log(this.name+" Time to connect",performance.now()-time);
      console.log(this.name, "socket is connected");
      this.onOpen();
      this.messageQueue.forEach((message) => this.send(message));
      this.messageQueue = [];
      this.dispatchEvent("open");
    });
    this.socket.on("close", async () => {
      console.log(this.name, "socket is closed");
      try {
        if (this.callConfig) {
          const agentId = (
            this.callConfig as { agent: { _id: any } }
          ).agent._id.toString();

          const analysis = await analyzeCall(
            this.callConfig.chatHistory.messages
          );
          // if (this.callConfig.isWebCall) {
          if (true) {
            await serverApi.post(
              `api/webcall/webhook/hangup`,
              {
                agentId: agentId,
                callId: this.callConfig.callId,
                callType: this.callConfig.callType,
                user_id: this.callConfig.agent.user_id,
                end_time: new Date().toISOString(),
                chat_history: this.callConfig.chatHistory.messages,
                summary: analysis?.summary,
                // call_status: analysis?.call_status,
                call_status: "Successful",
                user_sentiment: analysis?.user_sentiment,
                voice_engine_id: this.callConfig.elevenLab.voiceId,
                disconnection_reason: analysis?.disconnection_reason
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
      } catch (error) {
        console.error("Error processing end call event:", error);
      }
      this.onClose();
      this.dispatchEvent("close");
    });
    this.socket.on("error", (error) => {
      console.error(this.name, error);
    });
  }

  public send(data: any) {
    if (this.isReady) {
      this.socket.send(data);
    } else {
      this.messageQueue.push(data);
    }
  }
  get isReady() {
    return this.socket.readyState === WebSocket.OPEN;
  }
  get isClosed() {
    return this.socket.readyState === WebSocket.CLOSED;
  }

  public close() {
    this.socket.close();
  }
  protected onMessage(message: any) {}
  protected onOpen() {}
  protected onClose() {}
}

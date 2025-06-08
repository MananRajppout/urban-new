import { EventEmitter } from "node:events";

export interface TTSEvents {
  audio: (audio: string) => void;
  close: (error: Error | null) => void;
}
export default abstract class TTS extends EventEmitter {
  name = "TTS";

  on<K extends keyof TTSEvents>(event: K, listener: TTSEvents[K]): this {
    return super.on(event, listener);
  }

  emit<K extends keyof TTSEvents>(
    event: K,
    ...args: Parameters<TTSEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
  async connect() {}
  close() {}
  clear() {}
  sendText(text: string) {}
  sendDelta(delta: string, isFinal?: boolean) {}
}

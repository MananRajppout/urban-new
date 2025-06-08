import EventEmitter from "node:events";
export default class VoiceSynthesisQueue extends EventEmitter {
  private queue: Map<number, string | null> = new Map();
  private nextIndex = 0; // For enqueuing
  private emitIndex = 0; // For emitting

  constructor(private translate: (text: string) => Promise<string>) {
    super();
  }

  enqueueTranslation(text: string) {
    const index = this.nextIndex++;
    console.log("✅ Enqueuing translation:", text, index);

    this.translate(text)
      .then((translatedText) => {
        this.queue.set(index, translatedText);
        console.log("✅ Translation completed:", text, index);

        // Emit translations in order
        while (this.queue.has(this.emitIndex)) {
          const result = this.queue.get(this.emitIndex)!;
          this.queue.delete(this.emitIndex);
          this.emit("audio", { index: this.emitIndex, audio: result });
          this.emitIndex++;
        }
      })
      .catch((error) => {
        console.error("Translation error:", error);
      });
  }

  clear() {
    this.queue.clear();
    this.emitIndex = this.nextIndex;
  }
}

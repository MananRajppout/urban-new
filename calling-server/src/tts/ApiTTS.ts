import { CallConfig } from "../CallHandler.js";
import { ChunkedSentenceStream } from "./ChunkedSentenceStream.js";
import TTS from "./TTS.js";
import VoiceSynthesisQueue from "./VoiceSynthesisQueue.js";

export default abstract class ApiTTS extends TTS {
  // text
  protected chunkedSentenceStream = new ChunkedSentenceStream();

  //audio
  protected voiceSynthesisQueue: VoiceSynthesisQueue;

  constructor(public callConfig: CallConfig) {
    super();
    this.name = "ApiTTS";
    this.voiceSynthesisQueue = new VoiceSynthesisQueue(
      this.getAudio.bind(this),
    );
    this.voiceSynthesisQueue.on("audio", ({ audio }) => {
      this.emit("audio", audio);
    });
    this.chunkedSentenceStream.on("sentence", (sentence: string) => {
      console.log("✅ Sentence emitted:", sentence);
      this.sendText(sentence);
    });
  }

  close() {
    this.voiceSynthesisQueue.clear();
    this.chunkedSentenceStream.clear();
  }

  sendText(text: string) {
    this.voiceSynthesisQueue.enqueueTranslation(text);
  }

  sendDelta(delta: string, isFinal?: boolean) {
    this.chunkedSentenceStream.pushDelta(delta, isFinal || false);
  }

  protected abstract getAudio(text: string): Promise<string>;
}

import { STT, STTConfig } from "./STT.js";
import { DeepgramSTT } from "./DeepgramSTT.js";
import { GroqSTT } from "./GroqSTT.js";

export class STTFactory {
  static createSTT(sttName: string, config: STTConfig = {}): STT {
    console.log("Creating STT instance for:", sttName);

    const sttNameLower = sttName?.toLowerCase() || "";

    switch (true) {
      case sttNameLower.includes("deepgram-nova-3"):
        console.log("Initializing Deepgram STT");
        return new DeepgramSTT({
          model: "nova-3",
          ...config,
        });

      case sttNameLower.includes("groq") || sttNameLower.includes("whisper"):
        console.log("Initializing Groq Whisper STT");
        return new GroqSTT({
          model: "whisper-large-v3",
          ...config,
        });

      default:
        console.log("No specific STT specified, defaulting to Deepgram Nova 3");
        return new DeepgramSTT({
          model: "nova-3",
          ...config,
        });
    }
  }
}

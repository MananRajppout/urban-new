import wav from "wavefile";
import { CallConfig } from "../CallHandler.js";
import env from "../config/env.js";
import { writeFileSync } from "fs";
import ApiTTS from "./ApiTTS.js";

export default class SarvamTTS extends ApiTTS {
  constructor(callConfig: CallConfig) {
    super(callConfig);
    this.name = "SarvamTTS";
  }

  public async getAudio(text: string): Promise<string> {
    console.log("Fetching  ---> ", text);
    console.time("@TTS Sarvam fetch time " + text);
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "api-subscription-key": env.SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: this.callConfig.agent.voice_id,
        pitch: 0,
        pace: 1.2,
        loudness: 1,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: "bulbul:v1",
      }),
    });

    try {


      const data = await response.json();
      console.timeEnd("@TTS Sarvam fetch time " + text);
      let base64;
      try {
        base64 = data?.audios[0];
      } catch (error) {
        console.error("Error in SarvamTTS response", data,text);
      }
   

      const wavBuffer = Buffer.from(base64, "base64");
      const wavFile = new wav.WaveFile(new Uint8Array(wavBuffer));
      // @ts-ignore
      const pcmSamples = wavFile.data.samples;
      // convert PCM samples to base64
      const pcmBase64 = Buffer.from(pcmSamples).toString("base64");
      // return PCM data in base64
      return pcmBase64;
    } catch (error) {
      console.log((error as Error)?.message);
      return ''
    }
  }
}

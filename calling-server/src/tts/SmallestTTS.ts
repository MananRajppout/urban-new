import { CallConfig } from "../CallHandler.js";
import env from "../config/env.js";
import ApiTTS from "./ApiTTS.js";

export default class SmallestTTS extends ApiTTS {
  constructor(callConfig: CallConfig) {
    super(callConfig);
    this.name = "SmallestTTS";
  }

  public async getAudio(text: string): Promise<string> {
    console.log("Fetching  ---> ", text);
    console.time("@TTS Smallest.ai fetch time " + text);

    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.SMALLEST_AI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice_id: this.callConfig.agent.voice_id,
        add_wav_header: false,
        sample_rate: 16000,
        speed: this.callConfig.agent.voice_speed,
        language: "en",
      }),
    };

    const response = await fetch(
      "https://waves-api.smallest.ai/api/v1/lightning/get_speech",
      options
    );
    
    if(!response.ok){
      console.error("Error fetching audio from Smallest.ai", response.statusText,text);
      return ''
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("audioBuffer", audioBuffer.byteLength);
    console.timeEnd("@TTS Smallest.ai fetch time " + text);
    // convert PCM samples to base64
    const pcmBase64 = Buffer.from(audioBuffer).toString("base64");
    // return PCM data in base64
    return pcmBase64;
  }
}

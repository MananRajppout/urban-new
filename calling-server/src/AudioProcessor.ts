import { CallConfig } from "./CallHandler.js";
import { EventEmitter, EventTypes } from "./EventEmitter.js";
import AudioMixer from "./utils/AudioMixer.js";

// temp sound map
const soundFileMap = new Map<string, string>([
  ["call_center", "./other/bg.pcm"],
]);

interface AudioProcessorEventMap extends EventTypes {
  Audio: { audio: string };
}

export class AudioProcessor extends EventEmitter<AudioProcessorEventMap> {
  // private mixer: AudioMixer;
  constructor(private config: CallConfig) {
    super();
    // const bgFilePath = soundFileMap.get(config.agent.ambient_sound!);
    // this.mixer = new AudioMixer({
    //   bg: bgFilePath
    //     ? { path: bgFilePath, volume: config.agent.ambient_sound_volume }
    //     : undefined,
    // });
    // this.mixer.addDataCallback((data) => {
    //   this.dispatchEvent("Audio", { audio: data.toString("base64") });
    // });
    // this.mixer.addFirstChunkCallback(() => {
    //   this.config.time.processor = performance.now();
    //   this.config.time.log();
    // });
  }
  async start() {
    // await this.mixer.start();
  }
  clear() {
    // this.mixer.clear();
  }
  // 16bit  PCM_16000 audio
  sendAudio(base64: string) {
    // this.mixer.pushAudioBase64(base64);
    this.dispatchEvent("Audio", { audio: base64 });
  }
  close() {
    // this.mixer.close();
  }
}

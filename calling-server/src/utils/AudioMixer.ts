import { PassThrough } from "stream";
import AudioBufferReader from "./AudioBufferReader.js";
export type AudioMixerConfig = {
  bg?: {
    path: string;
    volume: number;
  };
};
export default class AudioMixer {
  private audioStream: PassThrough;
  private dataCallback: ((data: Buffer) => void) | null = null;
  private interval: number = 90;
  private intervalId: NodeJS.Timeout | null = null;
  private chunkSize: number = 3200;
  private outputBuffer: Int16Array;
  private reader: AudioBufferReader | null = null;
  public status: "running" | "stop" = "stop";

  private firstChunkCallback?: () => void;
  isFirstChunk = true;

  constructor(private config: AudioMixerConfig) {
    this.audioStream = new PassThrough({ highWaterMark: 1024 * 512 }); // 512KB
    this.outputBuffer = new Int16Array(this.chunkSize / 2);

    this.audioStream.on("close", () => {
      console.log("Audio stream closed");
    });
  }

  public get isBackgroundMix() {
    return this.config.bg != undefined;
  }
  addFirstChunkCallback(callback: () => void) {
    this.firstChunkCallback = callback;
  }

  pushAudio(buffer: Buffer): void {
    const result = this.audioStream.write(buffer);
    if (!result) {
      // console.log("Buffer full, please read from stream");
    }
  }
  pushAudioBase64(base64: string): void {
    const buffer = Buffer.from(base64, "base64");
    // console.log("Pushing audio buffer size", buffer.length);
    this.pushAudio(buffer);
  }

  clear(): void {
    this.isFirstChunk = true;
    // console.log(
    //   "Clearing audio stream buffer size",
    //   this.audioStream.writableLength
    // );
    let readSize = this.audioStream.readableLength;
    // this.audioStream.resume();
    // just read all data to clear buffer
    while (this.audioStream.read()) {}
    let afterReadSize = this.audioStream.readableLength;
    // console.log("Clear mixer", readSize, afterReadSize);
  }
  close() {
    this.stop();
    this.audioStream.end();
  }

  addDataCallback(callback: (data: Buffer) => void): void {
    this.dataCallback = callback;
  }

  async start(): Promise<void> {
    if (this.status === "stop") {
      this.status = "running";
      if (this.config.bg) {
        this.reader = await AudioBufferReader.load(this.config.bg.path);
      }
      this._loop();
    }
  }

  stop(): void {
   
    this.clear();
    this.status = "stop";
  }

  private _loop(): void {
    const processNext = () => {
      if (this.status === "running") {
        const startTime = process.hrtime.bigint(); // High-precision timer
        this.run(); // Call the `run` method
  
        // Calculate the processing time
        const elapsedTime = Number(process.hrtime.bigint() - startTime) / 1e6; // Convert to milliseconds
  
        // Schedule the next execution, ensuring it stays close to the desired interval
        const delay = Math.max(this.interval - elapsedTime, 0);
        setTimeout(processNext, delay);
      }
    };
  
    processNext(); // Start the loop
  }
  
  private run() {
    const bgChunk = this.reader?.read(this.chunkSize);
    const size =
      this.audioStream.readableLength < this.chunkSize
        ? this.audioStream.readableLength
        : this.chunkSize;
    const audioChunk = this.audioStream.read(size) as Buffer | null;

    const processedData = this._process(
      // new Int16Array(
      //   bgChunk.buffer,
      //   bgChunk.byteOffset,
      //   bgChunk.byteLength / 2
      // ),
      bgChunk
        ? new Int16Array(
            bgChunk.buffer,
            bgChunk.byteOffset,
            bgChunk.byteLength / 2
          )
        : null,
      audioChunk
        ? new Int16Array(
            audioChunk.buffer,
            audioChunk.byteOffset,
            audioChunk.byteLength / 2
          )
        : null
    );

    if (this.dataCallback && processedData) {
      this.dataCallback(processedData);
    }else{
      // console.log("No sound")
    }
  }

  private _process(
    bgSamples: Int16Array | null,
    audioSamples: Int16Array | null
  ): Buffer | null {
    let output = this.outputBuffer;
    const bgVolume = this.config.bg?.volume || 0.2;
    if (audioSamples) {
      if (this.isFirstChunk) {
        this.isFirstChunk = false;
        this.firstChunkCallback?.();
      }
      if (bgSamples) {
        // console.log("Mixing foreground and background audio.");
      } else {
        // console.log("Playing foreground audio only.");
      }
      if (audioSamples.length < this.chunkSize / 2) {
        output = new Int16Array(audioSamples.length);
      }
      for (let i = 0; i < output.length; i++) {
        output[i] = this._mixSamples(
          bgSamples ? bgSamples[i] : null,
          audioSamples[i],
          bgVolume,
          1
        );
      }
    } else if (bgSamples) {
      console.log("Playing background audio only.");
      for (let i = 0; i < output.length; i++) {
        output[i] = this._mixSamples(bgSamples[i], null, bgVolume);
      }
    } else {
      return null;
    }

    return Buffer.from(output.buffer);
  }

  private _mixSamples(
    bgSample: number | null,
    audioSample: number | null,
    bgWeight: number,
    audioWeight: number = 0
  ): number {
    const bgFloat = bgSample ? bgSample / 32768.0 : 0;
    const audioFloat = audioSample ? audioSample / 32768.0 : 0;
    let mixed = bgFloat * bgWeight + audioFloat * audioWeight;
    mixed = Math.min(1.0, Math.max(-1.0, mixed));
    return Math.round(mixed * 32768);
  }
}

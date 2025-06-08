import fs from "fs/promises";

const audioCache = new Map<string, Buffer>();

export default class AudioBufferReader {
  private filePath: string;
  private buffer: ArrayBuffer | null;
  private offset: number;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.buffer = null;
    this.offset = 0;
  }
  
  static async load(filePath: string): Promise<AudioBufferReader> {
    const reader = new AudioBufferReader(filePath);
    await reader._initialize();
    return reader;
  }

  private async _loadAudio(filePath: string): Promise<Buffer> {
    if (audioCache.has(filePath)) {
      console.log("Cache hit file:", filePath);
      return audioCache.get(filePath) as Buffer;
    }
    const data = await fs.readFile(filePath);
    // print size of file in bytes
    console.log("File size in bytes:",data.byteLength);
    audioCache.set(filePath, data);
    return data;
  }

  private async _initialize(): Promise<void> {
    const data = await this._loadAudio(this.filePath);
    this.buffer = data.buffer;
  }

  read(chunkSize: number): Uint8Array {
    if (!this.buffer) throw new Error("Buffer not initialized");

    const bufferLength = this.buffer.byteLength;
    const remainingBytes = bufferLength - this.offset;

    if (chunkSize <= remainingBytes) {
      const chunk = new Uint8Array(this.buffer, this.offset, chunkSize);
      this.offset += chunkSize;
      return chunk;
    } else {
      const chunk = new Uint8Array(chunkSize);
      const firstPart = new Uint8Array(this.buffer, this.offset, remainingBytes);
      const secondPart = new Uint8Array(this.buffer, 0, chunkSize - remainingBytes);

      chunk.set(firstPart, 0);
      chunk.set(secondPart, remainingBytes);

      this.offset = chunkSize - remainingBytes;
      return chunk;
    }
  }
}

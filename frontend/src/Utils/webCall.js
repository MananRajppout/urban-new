"use client";
import { nanoid } from "nanoid";
import { WavRecorder, WavStreamPlayer } from "wavtools";
export class EventEmitter {
  constructor() {
    this.listeners = new Map();
    this.addEventListener = this.on;
    this.dispatchEvent = this.emit;
  }
  // Add event listener
  on(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
    const unSubscribe = () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
    return unSubscribe;
  }
  // Emit event
  emit(type, event) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type);
      listeners.forEach((listener) => listener(event));
    }
  }
}
export class Utils {
  /**
   * Converts Float32Array of amplitude data to ArrayBuffer in Int16Array format
   * @param {Float32Array} float32Array
   * @returns {ArrayBuffer}
   */
  static floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }
  /**
   * Converts a base64 string to an ArrayBuffer
   * @param {string} base64
   * @returns {ArrayBuffer}
   */
  static base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  /**
   * Converts an ArrayBuffer, Int16Array or Float32Array to a base64 string
   * @param {ArrayBuffer|Int16Array|Float32Array} arrayBuffer
   * @returns {string}
   */
  static arrayBufferToBase64(arrayBuffer) {
    if (arrayBuffer instanceof Float32Array) {
      arrayBuffer = this.floatTo16BitPCM(arrayBuffer);
    } else if (arrayBuffer instanceof Int16Array) {
      arrayBuffer = new Int16Array(arrayBuffer).buffer;
    }
    let binary = "";
    let bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000; // 32KB chunk size
    for (let i = 0; i < bytes.length; i += chunkSize) {
      let chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  }
  /**
   * Merge two Int16Arrays from Int16Arrays or ArrayBuffers
   * @param {ArrayBuffer|Int16Array} left
   * @param {ArrayBuffer|Int16Array} right
   * @returns {Int16Array}
   */
  static mergeInt16Arrays(left, right) {
    if (left instanceof ArrayBuffer) {
      left = new Int16Array(left);
    }
    if (right instanceof ArrayBuffer) {
      right = new Int16Array(right);
    }
    if (!(left instanceof Int16Array) || !(right instanceof Int16Array)) {
      throw new Error(`Both items must be Int16Array`);
    }
    const newValues = new Int16Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      newValues[i] = left[i];
    }
    for (let j = 0; j < right.length; j++) {
      newValues[left.length + j] = right[j];
    }
    return newValues;
  }
  /**
   * Generates an id to send with events and messages
   * @param {string} prefix
   * @param {number} [length]
   * @returns {string}
   */
  static generateId(prefix, length = 21) {
    // base58; non-repeating chars
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const str = Array(length - prefix.length)
      .fill(0)
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
    return `${prefix}${str}`;
  }
}

export default class VoiceCaller extends EventEmitter {
  constructor(agentId) {
    super();
    this.agentId = agentId;
    this.streamId = "";
    this.callId = "";
    this.recorder = new WavRecorder({ sampleRate: 24000 });
    this.wavStreamPlayer = new WavStreamPlayer({ sampleRate: 16000 });
  }

  async call() {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.callId = nanoid();
    this.socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/media-stream?agentId=${this.agentId}&callType=web&callId=${this.callId}`
    );

    this.socket.addEventListener("open", async () => {
      console.log("socket connected");

      this.streamId = nanoid();
      this.socket?.send(
        JSON.stringify({
          event: "start",
          start: { streamId: this.streamId },
        })
      );
      this.emit("onCallStart", { streamId: this.streamId });
    });

    this.socket.addEventListener("message", async (event) => {
      const data = JSON.parse(event.data);
      // console.log(data);
      if (data.event === "clearAudio") {
        console.log("clear audio");
        this.wavStreamPlayer.interrupt();
      }
      if (data.event === "playAudio") {
        // convert base64 to Int16Array
        const audio = Utils.base64ToArrayBuffer(data.media.payload);
        const id = nanoid();
        this.wavStreamPlayer.add16BitPCM(audio, id);
        console.log("play audio");
      }
    });
    this.socket.onerror = (error) => {
      console.error("socket error", error);
    };
    this.socket.onclose = () => {
      console.log("socket closed");
      this.emit("onCallEnd");
    };
    await this.wavStreamPlayer.connect();
    const isGranted = await this.recorder.begin();
    if (!isGranted) {
      this.socket?.close();
    }

    await this.recorder.record((data) => {
      const base64 = Utils.arrayBufferToBase64(data.mono);
      if (this.socket.readyState === 1) {
        this.socket?.send(
          JSON.stringify({ event: "media", media: { payload: base64 } })
        );
      }
    });
  }
  async stop() {
    console.log(this.recorder.getStatus());
    if (this.recorder.getStatus() === "recording") {
      await this.recorder.pause();
      const finalAudio = await this?.recorder?.end();
      console.log(finalAudio);
    }
    this.socket?.close();
    this.socket = undefined;
    this.wavStreamPlayer.interrupt();
  }
}

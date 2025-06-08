import { EventEmitter } from "../EventEmitter.js";

export interface STTConfig {
  language?: string;
  model?: string;
  smart_format?: boolean;
}

export interface STTResult {
  transcript: string;
  confidence?: number;
  isFinal: boolean;
}

// Define the event map interface
interface STTEventMap {
  transcript: STTResult;
  error: Error;
}

export abstract class STT extends EventEmitter<STTEventMap> {
  protected config: STTConfig;
  protected isConnected: boolean = false;

  constructor(config: STTConfig = {}) {
    super();
    this.config = {
      language: "en-US",
      smart_format: true,
      ...config,
    };
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(audioData: Blob): Promise<void>;
  abstract isReady(): boolean;

  // Event types
  static readonly EVENTS = {
    TRANSCRIPT: "transcript",
    ERROR: "error",
  } as const;
}

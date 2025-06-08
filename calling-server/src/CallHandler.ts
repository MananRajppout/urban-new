import WebSocket from "ws";
import { PlivoSocket } from "./sockets/PlivoSocket.js";
import { ElevenLabSocket } from "./sockets/ElevenLabSocket.js";
import env from "./config/env.js";
import { OpenAiSocket } from "./sockets/OpenAiSocket.js";
import { VoiceSocket } from "./sockets/VoiceSocket.js";
import { IncomingMessage } from "http";
import { WebCallSocket } from "./sockets/WebCallSocket.js";
import { IAiAgent } from "./models/agent.model.js";
import AgentService from "./services/agent.service.js";
import plivoClient from "./config/plivo.js";
import axios, { AxiosError } from "axios";
import { AudioProcessor } from "./AudioProcessor.js";
import TTS from "./tts/TTS.js";
import SarvamTTS from "./tts/SarvamTTS.js";
import serverApi from "./utils/serverApi.js";
import { analyzeCall, createCalComBooking, DEFAULT_TOOLS } from "./utils.js";
import ElevenLabTTS from "./tts/ElevenLabTTS.js";
import SmallestTTS from "./tts/SmallestTTS.js";
import { STTFactory } from "./stt/STTFactory.js";
import { STT } from "./stt/STT.js";

export type CallConfig = {
  isWebCall: boolean;
  callId: string;
  agentId: string;
  callType: string;
  customer_name?: string;
  context?: string;
  phone_number?: string;
  is_outbound: boolean;

  agent: IAiAgent;

  dir: string;
  elevenLab: {
    voiceId: string;
    model: string;
    outputFormat: string;
  };
  time: {
    input: number;
    llm: number;
    // output: number;
    llm_done: number;
    tts: number;
    processor: number;
    flags: {
      isLLMFirstDelta: boolean;
      isTTSFirstDelta: boolean;
      isProcessorFirstChunk: boolean;
    };
    reset: () => void;
    log: () => void;
  };
  chatHistory: {
    messages: { role: "user" | "agent"; content: string; timestamp: number }[];
    addMessage: (role: "user" | "agent", content: string) => void;
    clear: () => void;
  };
};
type InitialCallConfig = Pick<
  CallConfig,
  "isWebCall" | "callId" | "agentId" | "callType" | "dir" | "customer_name" | "context" | "phone_number"
>;

export class CallHandler {
  // private elevenLabSocket: ElevenLabSocket;
  private openAiWebsocket: OpenAiSocket;
  private tts: TTS;
  private stt: STT;
  private transcriptionInProgress: boolean = false;
  private isEndCall: boolean = false;
  private SILENCE_TIMEOUT_SPEECH_1: string | null = null;

  private constructor(
    private audioSocket: VoiceSocket,
    private agent: IAiAgent,
    private configs: CallConfig,
    private processor: AudioProcessor,
  ) {
    if (this.agent?.welcome_message_file?.public_url) {
      // fetch(this.agent.welcome_message_file.public_url).then(res => res.text()).then(base65 => {
      //   this.processor.sendAudio(base65);
      // })
      // this.configs.chatHistory.addMessage(
      //   "agent",
      //   this.agent.welcome_message_text
      // );
    }

    // console.log("agent -> ", agent);
    const { openAiUrl } = this.buildUrls();
    // console.log(openAiUrl, "openAiUrl");

    // Check if using REST API mode for certain models
    const isRestApiMode = this.agent.chatgpt_model.includes("gpt-4o-mini");
    if (isRestApiMode) {
      console.log(
        `🔄 Using OpenAI REST API for model: ${this.agent.chatgpt_model}`,
      );
    } else {
      console.log(
        `🔄 Using OpenAI WebSocket API for model: ${this.agent.chatgpt_model}`,
      );
    }

    this.stt = STTFactory.createSTT(this.agent.STT_name || "deepgram-nova-3");
    this.stt.connect();

    console.log("tts -> ", this.agent.voice_engine_name);
    // create tts based on the agent
    if (this.agent.voice_engine_name == "sarvam") {
      this.tts = new SarvamTTS(this.configs);
    } else if (this.agent.voice_engine_name == "elevenlabs") {
      this.tts = new ElevenLabTTS(this.configs);
    } else if (this.agent.voice_engine_name == "smallest") {
      this.tts = new SmallestTTS(this.configs);
    } else {
      throw new Error(
        "unknown voice_engine_name = " + this.agent.voice_engine_name,
      );
    }
    console.log("tts -> ", this.tts.name);
    // if (this.agent?.welcome_message_text) {
    //   console.log("welcome_message_text -> ", this.agent.welcome_message_text);
    //   this.tts.sendText(this.agent.welcome_message_text);
    // }

    this.openAiWebsocket = new OpenAiSocket(
      {
        url: openAiUrl,
        configs: {
          headers: {
            Authorization: "Bearer " + env.OPENAI_API_KEY,
            "OpenAI-Beta": "realtime=v1",
          },
        },
      },
      this.configs,
      this.agent,
    );

    this.tts.connect().then(async () => {
      if (this.agent.welcome_message_text) {
        this.tts.sendText(this.agent.welcome_message_text);
        this.configs.chatHistory.addMessage(
          "agent",
          this.agent.welcome_message_text,
        );
      }

      if (this.agent.voice_engine_name == "smallest") {
        this.SILENCE_TIMEOUT_SPEECH_1 = await (
          this.tts as SmallestTTS
        ).getAudio(this.agent.silence_1_speech);
      }
      if (this.agent.voice_engine_name == "sarvam") {
        this.SILENCE_TIMEOUT_SPEECH_1 = await (this.tts as SarvamTTS).getAudio(
          this.agent.silence_1_speech,
        );
      }

      console.log("tts connected", this.tts.name);

      //we are using elevan labs realtime so dont need to prerecord
    });
    this.initializeEventListeners();
  }
  private buildUrls() {
    // const elevenLabId="FFmp1h1BMl0iVHA0JxrI"
    // const elevenLabModel="eleven_flash_v2_5"
    // const elevenOutputFormat="pcm_24000"
    const elevenLabConfigs = {
      voiceId: this.agent.voice_id,
      model: "eleven_flash_v2_5",
      // outputFormat: this.configs.isWebCall ? "pcm_16000" : "ulaw_8000",
      outputFormat: "pcm_16000",
    };
    return {
      elevenLabUrl: `wss://api.elevenlabs.io/v1/text-to-speech/${elevenLabConfigs.voiceId}/stream-input?model_id=${elevenLabConfigs.model}&output_format=${elevenLabConfigs.outputFormat}&inactivity_timeout=60`,
      openAiUrl: `wss://api.openai.com/v1/realtime?model=${this.agent.chatgpt_model}`,
    };
  }

  static buildCallConfig(
    config: InitialCallConfig,
    agent: IAiAgent,
  ): CallConfig {
    console.log("agent.voice_id", agent.voice_id);
    const now = performance.now();
    return {
      isWebCall: config.isWebCall,
      callId: config.callId,
      agentId: config.agentId,
      callType: config.callType,
      agent,
      dir: config.dir,
      elevenLab: {
        voiceId: agent.voice_id,
        model: "eleven_flash_v2_5",
        outputFormat: "pcm_16000",
      },
      time: {
        input: now,
        llm: now,
        tts: now,
        llm_done: now,
        processor: now,
        flags: {
          isLLMFirstDelta: true,
          isTTSFirstDelta: true,
          isProcessorFirstChunk: true,
        },
        reset() {
          const now = performance.now();
          this.input = now;
          this.llm = now;
          this.llm_done = now;
          this.tts = now;
          this.processor = now;
          this.flags.isLLMFirstDelta = true;
          this.flags.isTTSFirstDelta = true;
          this.flags.isProcessorFirstChunk = true;
        },
        log() {
          console.log("------stats in ms--------");
          console.log("input -> llm", this.llm - this.input);
          console.log("llm -> llm_done", this.llm_done - this.llm);
          console.log("llm -> tts", this.tts - this.llm);
          console.log("llm_done -> tts", this.tts - this.llm_done);
          console.log("tts -> out", this.processor - this.tts);
          console.log("in -> out", this.processor - this.input);
          console.log("time -> ", this);
        },
      },
      chatHistory: {
        messages: [],
        addMessage(role, content) {
          this.messages.push({ role, content, timestamp: Date.now() });
        },
        clear() {
          this.messages = [];
        },
      },
      customer_name: config.customer_name,
      context: config.context,
      phone_number: config.phone_number,
      is_outbound: config.isWebCall ? false : config.dir == "out"
    };
  }
  

  static async Init(ws: WebSocket, request: IncomingMessage) {
    try {
      const params = new URLSearchParams(request.url?.split("?")[1]);
      const query = Object.fromEntries(params);

      const { agentId, callType, callId, dir = "",customer_name=undefined,context=undefined,phone_number=undefined } = query;


      const config: InitialCallConfig = {
        isWebCall: callType === "web",
        callId: callId as string,
        agentId: agentId as string,
        callType: callType as string,
        dir: dir as string,
        context: context as string,
        customer_name: customer_name as string | undefined,
        phone_number: phone_number as string | undefined
      };

      //console.log("Calling through", { query });

      if (!agentId && !callId) {
        ws.close();
        throw new Error(
          "Invalid query parameters: agentId or callId is required.",
        );
      }
      console.log(callType);
      if (callType === "web") {
        return await this.handleWebCall(ws, config);
      }

      if (callType === "plivo") {
        return await this.handlePlivoCall(ws, config);
      }

      throw new Error(`Invalid callType: ${callType}`);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Error initializing call:", error.response?.data);
      } else {
        console.error("Error initializing call:", error);
      }
      ws.close();
    }
  }

  private static async handleWebCall(ws: WebSocket, config: InitialCallConfig) {
    const start_time = new Date().toISOString();
    console.time("Agent by id");
    const agent = await AgentService.getAgentById(config.agentId);
    console.timeEnd("Agent by id");

    if (!agent) {
      throw new Error(`Agent not found for agentId: ${config.agentId}`);
    }

    // call webhook to send call info , throw error if failed or invalid
    console.time("@@webhook/pickup");
    serverApi.post(
      `api/webcall/webhook/pickup`,
      {
        agentId: agent._id,
        callId: config.callId,
        callType: config.callType,
        user_id: agent.user_id,
        start_time: start_time,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.timeEnd("@@webhook/pickup");

    const socket = new WebCallSocket({ ws });
    socket.addEventListener("close", async () => {
      // const analysis = await analyzeCall(configWithAgent.chatHistory.messages);
      // console.log(analysis);
      // serverApi.post(
      //   `api/webcall/webhook/hangup`,
      //   {
      //     agentId: agent._id,
      //     callId: config.callId,
      //     callType: config.callType,
      //     user_id: agent.user_id,
      //     end_time: new Date().toISOString(),
      //     start_time,
      //     chat_history: configWithAgent.chatHistory.messages,
      //     summary: analysis?.summary,
      //     call_status: analysis?.call_status,
      //     user_sentiment: analysis?.user_sentiment,
      //     voice_engine_id: configWithAgent.elevenLab.voiceId,
      //     disconnection_reason: analysis?.disconnection_reason,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
    });
    const configWithAgent = CallHandler.buildCallConfig(config, agent);
    const processor = new AudioProcessor(configWithAgent);
    processor.start();
    return new CallHandler(socket, agent, configWithAgent, processor);
  }

  private static async handlePlivoCall(
    ws: WebSocket,
    config: InitialCallConfig,
  ) {
    const callInfo = await plivoClient.calls.getLiveCall(config.callId);

    const phone = config.dir == "out" ? callInfo.from : callInfo.to;
    const agent = await AgentService.getAgentByPlivoPhone(phone);
    if (!agent) {
      throw new Error(`Agent not found for phone: ${phone}`);
    }
    const configWithAgent = CallHandler.buildCallConfig(config, agent);
    const processor = new AudioProcessor(configWithAgent);
    await processor.start();
    return new CallHandler(
      new PlivoSocket({ ws }, configWithAgent),
      agent,
      configWithAgent,
      processor,
    );
  }

  private initializeEventListeners() {
    let base_prompt = this.agent.base_prompt;

    //replace variables in the base prompt
    if(this.configs.is_outbound){
      if(this.configs.customer_name) base_prompt = base_prompt.replace("{{customer_name}}", this.configs.customer_name);
      if(this.configs.context) base_prompt =  base_prompt.replace("{{context}}", this.configs.context);
      if(this.configs.phone_number) base_prompt = base_prompt.replace("{{phone_number}}", this.configs.phone_number);
    }
    
    this.openAiWebsocket.updateSession(
      base_prompt,
      this.agent.calendar_tools[0],
      [
        {
          type: "function",
          name: "hang_up_call",
          description:
            "Ends the call. Optionally speaks a final sentence before hanging up. The call should be ended when the following condition is fulfilled or matched.",
          parameters: {
            type: "object",
            properties: {
              last_speak: {
                type: "string",
                description:
                  "Optional final sentence to say before hanging up the call.",
              },
            },
            required: [],
          },
        },
        {
          type: "function",
          name: "book_appointment",
          description:
            "Creates a booking entry with client and appointment details, including time, location, email, and reason for the appointment.",
          parameters: {
            type: "object",
            properties: {
              start: {
                type: "string",
                description:
                  "The start date and time of the booking in ISO 8601 format.",
              },
              responses: {
                type: "object",
                properties: {
                  location: {
                    type: "object",
                    properties: {
                      optionValue: {
                        type: "string",
                        description:
                          "The chosen location option for the appointment.",
                      },
                      value: {
                        type: "string",
                        description:
                          "The display value for the appointment location.",
                      },
                    },
                    required: ["optionValue", "value"],
                  },
                  email: {
                    type: "string",
                    description: "The email address of the client.",
                  },
                  name: {
                    type: "string",
                    description: "The full name of the client.",
                  },
                },
                required: ["location", "email", "name"],
              },
              metadata: {
                type: "object",
                properties: {
                  reason: {
                    type: "string",
                    description: "The reason for the appointment or meeting.",
                  },
                },
                required: ["reason"],
              },
              language: {
                type: "string",
                description: "The language preference for the appointment.",
              },
            },
            required: [
              "eventTypeId",
              "start",
              "responses",
              "metadata",
              "timeZone",
              "language",
            ],
          },
        },
        {
          type: "function",
          name: "get_available_slots",
          description: "Fetches all available slots",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "A loading message to speak while fetching available slots.",
              },
            },
            required: ['message'],
          },
        },
      ],

      this.agent.hang_up_prompt,
    );

    if (this.agent.welcome_message_text) {
      this.openAiWebsocket.sendUserMessage(
        this.agent.welcome_message_text,
        false,
        "assistant",
      );
      this.openAiWebsocket.sendUserMessage(
        "The welcome and greeting have already been done. Do not repeat them again.",
        false,
        "system",
      );
    }

    // Add STT event listeners
    this.stt.on("transcript", (result) => {
      const transcriptReceiveTime = performance.now();
      this.transcriptionInProgress = false;

      // console.log("\n\n");
      // console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯");
      // console.log("📝 TRANSCRIPT EVENT RECEIVED IN CALL HANDLER");
      // console.log("Result object:", JSON.stringify(result, null, 2));
      // console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯");
      // console.log("\n\n");

      if (result.transcript) {
        const wordCount = result.transcript.trim().split(/\s+/).length;
        // console.log(
        //   `📊 LATENCY - Transcript received - Words: ${wordCount} - Type: ${
        //     result.isFinal ? "Final" : "Partial"
        //   }`
        // );

        // Only process final transcriptions, ignore partial ones
        if (result.isFinal) {
          // Add the transcription to chat history
          this.configs.chatHistory.addMessage("user", result.transcript);

          // console.log("\n");
          // console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐");
          // console.log(`📣 FINAL TRANSCRIPT RECEIVED: "${result.transcript}"`);
          // console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐");
          // console.log("\n");

          // // Process final transcription with OpenAI
          // console.log(
          //   "📢 SENDING FINAL TRANSCRIPT TO OPENAI:",
          //   result.transcript
          // );
          const sendTime = performance.now();
          // console.log(
          //   `📊 LATENCY - STT Processing Time: ${(
          //     sendTime - transcriptReceiveTime
          //   ).toFixed(2)}ms`
          // );

          // this.openAiWebsocket.sendUserMessage(result.transcript);
        } else {
          console.log("Ignoring partial transcript, waiting for final version");
        }
      }
    });

    this.stt.on("error", (error) => {
      console.error("STT Error:", error);
    });

    // ----------------- callbacks -----------------
    this.audioSocket.addEventListener("Media", this.handleMedia.bind(this));
    this.openAiWebsocket.addEventListener(
      "ResponseTextDelta",
      this.handleResponseTextDelta.bind(this),
    );
    this.openAiWebsocket.addEventListener(
      "ResponseTextDone",
      this.handleResponseTextDone.bind(this),
    );
    this.openAiWebsocket.addEventListener("HangUp", this.HangUpCall.bind(this));

    this.openAiWebsocket.addEventListener("NO_SPEAK_1", () => {
      try {
        console.log("NO_SPEAK_1 called");
        if (!this.audioSocket.isClosed) {
          if (this.SILENCE_TIMEOUT_SPEECH_1)
            this.processor.sendAudio(this.SILENCE_TIMEOUT_SPEECH_1 as string);
          if (!this.SILENCE_TIMEOUT_SPEECH_1)
            this.tts.sendText(this.agent.silence_1_speech as string);
          this.configs.chatHistory.addMessage(
            "agent",
            this.agent.silence_1_speech,
          );
        }

        this.openAiWebsocket.sendUserMessage(
          this.agent.silence_1_speech,
          false,
          "assistant",
        );
      } catch (error) {
        console.log((error as Error).message);
      }
    });

    this.openAiWebsocket.addEventListener("NO_SPEAK_2", () => {
      console.log("NO_SPEAK_2 called");
      if (!this.audioSocket.isClosed) {
        this.HangUpCall({ last_speak: this.agent.silence_2_speech });
      }
    });

    this.openAiWebsocket.addEventListener(
      "InputAudioStarted",
      this.handleInputAudioStarted.bind(this),
    );
    this.openAiWebsocket.addEventListener(
      "FunctionCallEndCall",
      ({ message }) => {
        // console.log("calling ending", message);
        this.tts.sendText(message);
        const wordCount = message.split(/\s+/).length;
        const durationInSeconds = parseFloat(
          (wordCount / (120 / 60)).toFixed(2),
        );
        // console.log("duration in end call ", durationInSeconds);
        setTimeout(
          () => {
            this.audioSocket.close();
          },
          durationInSeconds * 1000 + 1000,
        );
      },
    );

    this.tts.on("audio", (audio) => {
      console.log("Send Audio....", typeof audio);
      this.processor.sendAudio(audio);
    });

    this.processor.addEventListener("Audio", this.handleAudio.bind(this));

    // close other socket
    this.audioSocket.addEventListener("close", this.handleClose.bind(this));
    this.openAiWebsocket.addEventListener("close", this.handleClose.bind(this));
    this.tts.addListener("close", this.handleClose.bind(this));
  }
  private handleClose() {
    console.log("Closing sockets...");
    this.openAiWebsocket.close();
    this.audioSocket.close();
    this.processor.close();
    this.tts.close();
    this.stt.disconnect();
  }

  private handleMedia({ audio }: { audio: any }) {
    // If using WebSocket API, send audio directly
    if (
      this.openAiWebsocket.isReady &&
      !this.agent.chatgpt_model.includes("gpt-4o-mini")
    ) {
      // console.log("Sending audio to OpenAI WebSocket API...");
      this.openAiWebsocket.sendAudio(audio);
      return;
    }

    try {
      // console.log("Received audio data for processing, size:", audio.length);

      // Determine if we're using Groq
      const isGroq =
        this.agent.STT_name?.toLowerCase().includes("groq") ||
        this.agent.STT_name?.toLowerCase().includes("whisper");

      // console.log("STT service type:", {
      //   name: this.agent.STT_name,
      //   isGroq,
      // });

      // Convert base64 to binary data
      const binaryData = atob(audio);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      // Determine MIME type based on STT service
      let mimeType = "audio/webm;codecs=opus";

      // For Groq, use WAV format which is better supported
      if (isGroq) {
        mimeType = "audio/wav";
        // console.log("Using WAV format for Groq STT");
      }

      const audioBlob = new Blob([uint8Array], { type: mimeType });

      // console.log("Converted audio to blob:", {
      //   size: audioBlob.size,
      //   type: audioBlob.type,
      //   sttType: this.agent.STT_name,
      //   dataLength: uint8Array.length,
      // });

      // Debug: Log first few bytes to help identify format
      const firstBytes = Array.from(uint8Array.slice(0, 16))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      // console.log(`Audio data first bytes: ${firstBytes}`);

      // Send the blob to STT with proper error handling
      // console.log("🔊 Sending audio blob to STT service...");
      this.stt
        .send(audioBlob)
        .then(() => {
          // console.log("Audio successfully sent to STT service");
        })
        .catch((error) => {
          console.error("Error sending audio to STT service:", error);
        });
    } catch (error) {
      console.error("Error processing audio data:", error);
    }
  }

  private handleResponseTextDelta({ delta }: { delta: any }) {
    // this.elevenLabSocket.sendText(delta);
    this.tts.sendDelta(delta);
  }

  private HangUpCall({ last_speak }: { last_speak: any }) {
    console.log("HangUp Call", last_speak);
    this.configs.chatHistory.addMessage("agent", last_speak);
    this.tts.sendText(last_speak);
    const wordCount = last_speak.split(/\s+/).length;
    const durationInSeconds = parseFloat((wordCount / (120 / 60)).toFixed(2));

    setTimeout(
      () => {
        this.audioSocket.close();
      },
      durationInSeconds * 1000 + 1000,
    );
  }

  private handleResponseTextDone({ text }: { text: any }) {
    this.configs.chatHistory.addMessage("agent", text);
    if (text.includes("appointment_book")) {
      createCalComBooking(this.configs, text)
        .then((data) => {
          if (data.message) {
          } else {
          }
        })
        .catch(() => { });
    } else {
    }
    this.tts.sendDelta("", true);

    // Log comprehensive latency summary
    const now = performance.now();
    // console.log("\n");
    // console.log("📈📈📈 LATENCY SUMMARY 📈📈📈");
    // console.log("──────────────────────────────────────────");
    // console.log(`Total response length: ${text.length} characters`);
    // console.log("Timeline:");
    // console.log(
    //   `➡️ Input processing: ${(
    //     this.configs.time.llm - this.configs.time.input
    //   ).toFixed(2)}ms`
    // );
    // console.log(
    //   `➡️ LLM first token: ${(
    //     this.configs.time.llm_done - this.configs.time.llm
    //   ).toFixed(2)}ms`
    // );
    // console.log(
    //   `➡️ TTS processing: ${(
    //     this.configs.time.tts - this.configs.time.llm
    //   ).toFixed(2)}ms`
    // );
    // console.log(
    //   `➡️ Audio output: ${(
    //     this.configs.time.processor - this.configs.time.tts
    //   ).toFixed(2)}ms`
    // );
    // console.log(
    //   `➡️ Total pipeline: ${(now - this.configs.time.input).toFixed(2)}ms`
    // );

    // Calculate token generation speed (estimated)
    const tokensEstimate = text.length / 4; // rough estimate: 4 chars per token
    const generationTimeSeconds =
      (this.configs.time.llm_done - this.configs.time.llm) / 1000;
    const tokensPerSecond = tokensEstimate / generationTimeSeconds;

    // console.log(`Estimated tokens: ~${Math.round(tokensEstimate)}`);
    // console.log(`Generation time: ${generationTimeSeconds.toFixed(2)}s`);
    // console.log(`Tokens per second: ~${Math.round(tokensPerSecond)} TPS`);
    // console.log("──────────────────────────────────────────");
    // console.log("\n");
  }

  private handleInputAudioStarted({ cancel = true }: { cancel: boolean }) {
    this.audioSocket.clearAudio();
    if (cancel) {
      this.openAiWebsocket.cancelResponse();
    }
    this.processor.clear();
  }

  private handleAudio({ audio }: { audio: any }) {
    this.audioSocket.sendAudio(
      audio,
      this.isEndCall ? { checkPoint: { name: "endCall" } } : undefined,
    );
  }
}

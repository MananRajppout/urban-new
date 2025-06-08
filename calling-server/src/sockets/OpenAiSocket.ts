import { CallConfig } from "../CallHandler.js";
import {
  bookAppointmentRequest,
  createCalComBooking,
  formatAvailableSlots,
  getFormattedDate,
} from "../utils.js";
import { BasicSocket, SocketArgs, SocketEventMap } from "./BasicSocket.js";
import env from "../config/env.js";
import { IAiAgent } from "../models/agent.model.js";
import { fetchAvailableSlots } from "../utils/fetchAvaibleSlots.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Role = "user" | "assistant" | "system";
interface OpenAiEventMap extends SocketEventMap {
  InputAudioStarted: { cancel: boolean };
  ResponseTextDelta: { delta: string };
  ResponseTextDone: { text: string };
  FunctionCallEndCall: { message: string };
  HangUp: { last_speak: string };
  NO_SPEAK_1: {};
  NO_SPEAK_2: {};
}

export class OpenAiSocket extends BasicSocket<OpenAiEventMap> {
  lastResponseEventId = "";
  private isUsingRestApi = false;
  private isGeneratingResponse = false;
  private manualReadyState = false;
  private no_speak_1: NodeJS.Timeout | null = null;
  private no_speak_2: NodeJS.Timeout | null = null;
  private llm_speech_time_out: NodeJS.Timeout | null = null;
  private agent: IAiAgent | null = null;

  constructor(
    args: SocketArgs,
    protected callConfig: CallConfig,
    agent: IAiAgent,
  ) {
    super(args);
    this.name = "OpenAiSocket";
    this.agent = agent;

    // Check if using a model that requires REST API instead of WebSocket
    this.isUsingRestApi =
      this.callConfig.agent.chatgpt_model.includes("gpt-4o-mini");

    if (this.isUsingRestApi) {
      console.log(
        `🔄 Using REST API for model: ${this.callConfig.agent.chatgpt_model}`,
      );
      // For REST API, we're manually setting ready state
      this.manualReadyState = true;
    }
  }

  get time() {
    return this.callConfig.time;
  }

  // Override isReady getter to handle REST API mode
  get isReady(): boolean {
    return this.isUsingRestApi ? this.manualReadyState : super.isReady;
  }

  protected onOpen(): void {
    const text = this.agent?.welcome_message_text || "";

    const wordCount = text.split(/\s+/).length;
    const durationInSeconds = parseFloat((wordCount / (120 / 60)).toFixed(2));

    setTimeout(() => {
      this.handleNoSpeack("Timer Start");
    }, durationInSeconds * 1000);

    if (!this.isUsingRestApi) {
      console.log(
        `🔄 Using WebSocket for model: ${this.callConfig.agent.chatgpt_model}`,
      );
    }
  }

  protected onClose(): void {
    console.log("OpenAiSocket closed");
    if (this.no_speak_1) clearTimeout(this.no_speak_1);
    if (this.no_speak_2) clearTimeout(this.no_speak_2);
  }

  protected async onMessage(message: any): Promise<void> {
    if (this.isUsingRestApi) return; // Skip WebSocket message handling for REST API mode

    try {
      const response = JSON.parse(message);
      const { type } = response;
      // console.log("OpenAiSocket", JSON.stringify(response));

      switch (type) {
        case "response.created":
          this.lastResponseEventId = response.event_id;
          console.log(`📊 LATENCY - LLM Request Started: ${performance.now()}`);
          break;
        case "input_audio_buffer.speech_started":
          this.handleNoSpeack("User Speack started");
          this.dispatchEvent("InputAudioStarted", { cancel: false });
          break;
        case "input_audio_buffer.speech_stopped":
          break;
        case "conversation.item.input_audio_transcription.completed":
          // this.handleNoSpeack("User Speack");
          if (this.no_speak_1) clearTimeout(this.no_speak_1);
          if (this.no_speak_2) clearTimeout(this.no_speak_2);
          if (response.transcript) {
            this.callConfig.chatHistory.addMessage("user", response.transcript);
          }
          break;
        case "input_audio_buffer.committed":
          this.time.reset();
          this.time.input = performance.now();
          break;
        // first text output
        case "response.content_part.added":
          break;

        case "response.text.delta":
          console.log("response.text.delta => ", `[${response.delta}]`);
          if (this.time.flags.isLLMFirstDelta) {
            this.time.llm = performance.now();
            this.time.flags.isLLMFirstDelta = false;
            console.log(
              `📊 LATENCY - LLM First Token: ${performance.now() - this.time.input
              }ms`,
            );
          }

          this.dispatchEvent("ResponseTextDelta", { delta: response.delta });

          break;
        case "response.text.done":
          response.text = response.text.replaceAll("\\n", " ");
          response.text = response.text.replaceAll("*", "");
          console.log("✅response.text.done", response.text);
          this.dispatchEvent("InputAudioStarted", { cancel: false });
          if (this.llm_speech_time_out) clearTimeout(this.llm_speech_time_out);
          if (this.no_speak_1) clearTimeout(this.no_speak_1);
          if (this.no_speak_2) clearTimeout(this.no_speak_2);

          const wordCount = response.text.split(/\s+/).length;
          const durationInSeconds = parseFloat(
            (wordCount / (120 / 60)).toFixed(2),
          );

          this.llm_speech_time_out = setTimeout(() => {
            this.handleNoSpeack(`LLM speack done ${response.text}`);
          }, durationInSeconds * 1000);

          this.time.llm_done = performance.now();
          console.log(
            `📊 LATENCY - LLM Full Response Time: ${this.time.llm_done - this.time.llm
            }ms`,
          );
          console.log(
            `📊 LATENCY - LLM Response Rate: ~${Math.round(
              response.text.length /
              ((this.time.llm_done - this.time.llm) / 1000),
            )} chars/second`,
          );

          // this.callConfig.chatHistory.addMessage("agent", response.text);
          if (response.text.includes("appointment_details")) {
            createCalComBooking(this.callConfig, response.text)
              .then((data) => {
                if (data.message) {
                  this.dispatchEvent("ResponseTextDone", {
                    text: "Failed to book the appointment. Please choose another date or time.",
                  });
                } else {
                  this.dispatchEvent("ResponseTextDone", {
                    text: "Your booking is confirmed.",
                  });
                }
              })
              .catch(() => {
                this.dispatchEvent("ResponseTextDone", {
                  text: "An error occurred while booking the appointment. Please try again later.",
                });
              });
          } else {
            this.dispatchEvent("ResponseTextDone", { text: response.text });
          }

          break;
        case "response.function_call_arguments.done":
          const function_name = response.name;
          const args = JSON.parse(response.arguments);
          console.log("function_name", function_name, response.tool_call_id);
          if (function_name == "hang_up_call") {
            this.dispatchEvent("HangUp", {
              last_speak: args.last_speak,
            });
          } else if (function_name == "get_available_slots") {
            try {
             
              this.emit("ResponseTextDelta",{delta: args.message});
              const availableSlots = await fetchAvailableSlots(
                this.callConfig.agent.calendar_tools[0],
              );
              this.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    output: JSON.stringify(availableSlots),
                    call_id: response.call_id,
                  },
                }),
              );
              this.send(
                JSON.stringify({
                  type: "response.create",
                  response: {
                    modalities: ["text", "audio"],
                    instructions: `Firstly, complete the current conversation, then respond to the user with the available slots: ${availableSlots}. Make sure that the text is readable, which means it should be like '24th and 25th april twenty fourth and twenty fifth April we have slots available which date do you prefer?'. This should not be in a JSON format, but rather in a natural, easy-to-understand way. For instance, if we are discussing available times, it should be clear like, 'user tells which date he want than you will tell on 25th we have 9am to 1pm.' rather than using just the numeric format. most importantly, if the user choose to book appointment, make sure to invoke the 'book_appointment' function.`,
                  },
                }),
              );
            } catch (error) {
              console.error("Error fetching available slots:", error);
            }
          } else if (function_name == "book_appointment") {
            bookAppointmentRequest(this.callConfig, args)
              .then((data) => {
                this.send(
                  JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      output: JSON.stringify(data),
                      call_id: response.call_id,
                    },
                  }),
                );
                this.send(
                  JSON.stringify({
                    type: "response.create",
                    response: {
                      modalities: ["text", "audio"],
                      instructions: `Firstly, complete the current conversation, then response to the user with the booking confirmation: ${data}. Make sure you read this in an readable text format, not like a JSON format. ex: Alright your booking has been confirmed.`,
                    },
                  }),
                );
              })
              .catch((error) => {
                this.send(
                  JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      output: JSON.stringify(error),
                      call_id: response.call_id,
                    },
                  }),
                );
                this.send(
                  JSON.stringify({
                    type: "response.create",
                    response: {
                      modalities: ["text", "audio"],
                      instructions: `Firstly, complete the current conversation, then Respond to the user with the error: ${error}. Make sure you read this in an readable text format, not like a JSON format.`,
                    },
                  }),
                );
              });
          }
          break;
        case "error":
          console.error("OpenAiSocket error", response);
      }
    } catch (error) {
      console.error(this.name, error);
    }
  }

  private handleNoSpeack(message: null | string = null) {
    if (message) console.log("NOSPEAK:", message);
    if (this.no_speak_1) clearTimeout(this.no_speak_1);
    if (this.no_speak_2) clearTimeout(this.no_speak_2);

    this.no_speak_1 = setTimeout(
      () => {
        console.log("CALL_4567:", message);
        this.emit("NO_SPEAK_1", {});
        this.no_speak_2 = setTimeout(
          () => {
            this.emit("NO_SPEAK_2", {});
          },
          Number(this.agent?.silence_2_timeout || 10) * 1000,
        );
      },
      Number(this.agent?.silence_1_timeout || 10) * 1000,
    );
  }

  sendAudio(audio: string) {
    if (this.isUsingRestApi) return; // No audio support in REST API mode

    this.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio,
      }),
    );
  }

  cancelResponse() {
    console.log("Canceling response generation");
    if (this.isUsingRestApi) {
      this.isGeneratingResponse = false;
      console.log("Cancelled REST API response generation");
      return;
    }

    this.send(
      JSON.stringify({
        type: "response.cancel",
      }),
    );
  }

  async updateSession(
    instruction: string,
    calendar_tools: any | null,
    tools: any,
    hang_up_prompt: string = "",
  ): Promise<void> {
    if (this.isUsingRestApi) {
      console.log("Session updated for REST API mode");
      return;
    }

    const isWebCall: boolean = this.callConfig.isWebCall;
    let availableSlot: any = "";
    let instructions = instruction;

    if (calendar_tools) {
      const startTime: string = getFormattedDate(
        0,
        calendar_tools.AvailabilityCaltimezone,
      );
      const endTime: string = getFormattedDate(
        7,
        calendar_tools.AvailabilityCaltimezone,
      );

      const url: string =
        `https://api.cal.com/v1/slots?apiKey=${calendar_tools.AvailabilityCalapiKey}` +
        `&eventTypeId=${calendar_tools.AvailabilityCaleventTypeId}` +
        `&startTime=${startTime}&endTime=${endTime}&timeZone=${encodeURIComponent(
          calendar_tools.AvailabilityCaltimezone,
        )}`;
      try {
        const response: Response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const calRes: any = await response.json();
          availableSlot = formatAvailableSlots(calRes.slots);

          // Available slots:
          // ${JSON.stringify(availableSlot)}
          instructions = `
          Instructions:
            ${instruction}
          
          The call should be ended when the following condition is fulfilled or matched:
            ${hang_up_prompt}. 
          This condition can include specific phrases, user actions, or silence that indicates the conversation has concluded. call 'hang_up_call' function for hangup the call.
          
          Critical Note:
            - most importanly If you want to book appointment or you choose to book appoinment, make sure to invoke the 'book_appointment' function.
            - If the conversation has ended or you choose to hang up the call, make sure to invoke the 'hang_up_call' function.
            - If you need to fetch available slots or you choose to fetch avaible slots, make sure to invoke the 'get_available_slots' function.
           `;
        } else {
          console.error("Failed to fetch slots from Cal.com API");
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    } else {
      instructions = `
          Instructions:
            ${instruction}
          
          Hang Up Call Instructions:
          The call should be ended when the following condition is fulfilled or matched:
            ${hang_up_prompt}. 
          This condition can include specific phrases, user actions, or silence that indicates the conversation has concluded.

          Critical Note:
            - If the conversation has ended or you choose to hang up the call, make sure to invoke the 'hang_up_call' function.
        `;
    }

    const data = {
      type: "session.update",
      session: {
        turn_detection: {
          type: "server_vad",
          threshold: 0.7,
          prefix_padding_ms: 150,
          silence_duration_ms: 250,
        },
        tools,
        tool_choice: "auto",
        input_audio_format: "g711_ulaw",
        output_audio_format: "g711_ulaw",
        modalities: ["text"],
        input_audio_transcription: {
          model: "whisper-1",
        },
        temperature: 0.8,
        voice: "alloy",
        instructions,
      },
    };

    if (isWebCall) {
      data.session.input_audio_format = "pcm16";
      data.session.output_audio_format = "pcm16";
    }

    this.send(JSON.stringify(data));
  }

  sendUserMessage(message: string, isResponse = true, user: Role = "user") {
    if (this.isUsingRestApi) {
      // Queue the message for AI processing
      console.log("Processing final transcript message:", message);

      // Add a short delay to ensure any additional transcripts have been processed
      setTimeout(() => {
        this.sendMessageViaRestApi(message);
      }, 100);

      return;
    }

    const initialConversationItem = {
      type: "conversation.item.create",
      item: {
        type: "message",
        // role: "user",
        role: user,
        content: [
          {
            type: user == "assistant" ? "text" : "input_text",
            text: message,
          },
        ],
      },
    };
    this.send(JSON.stringify(initialConversationItem));
    if (isResponse) {
      this.send(JSON.stringify({ type: "response.create" }));
    }
  }

  async sendMessageViaRestApi(message: string) {
    if (this.isGeneratingResponse) {
      console.log("Already generating a response, cancelling previous");
      this.isGeneratingResponse = false;
      // Wait a moment to ensure any ongoing operations are completed
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isGeneratingResponse = true;
    this.time.reset();
    this.time.input = performance.now();
    console.log(`📊 LATENCY - REST API Request Started: ${this.time.input}`);

    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // Get conversation history
    const chatHistory = this.callConfig.chatHistory.messages.map((msg) => ({
      role: msg.role === "agent" ? "assistant" : "user",
      content: msg.content,
    }));

    // Add system prompt
    const messages = [
      { role: "system", content: this.callConfig.agent.base_prompt },
      ...chatHistory,
      { role: "user", content: message },
    ];

    const requestBody = {
      model: this.callConfig.agent.chatgpt_model,
      messages,
      stream: true,
      temperature: 0.8,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to connect to OpenAI API:",
          response.status,
          errorText,
        );
        this.isGeneratingResponse = false;
        return;
      }

      // Stream handling
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let partialMessage = "";

      while (reader && this.isGeneratingResponse) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!this.isGeneratingResponse) break;

          if (line.startsWith("data:")) {
            const jsonString = line.substring(5).trim();
            if (jsonString === "[DONE]") {
              // End of stream
              break;
            }

            if (jsonString) {
              try {
                const jsonData = JSON.parse(jsonString);
                const delta = jsonData.choices?.[0]?.delta?.content;

                if (delta) {
                  if (this.time.flags.isLLMFirstDelta) {
                    this.time.llm = performance.now();
                    this.time.flags.isLLMFirstDelta = false;
                    console.log(
                      `📊 LATENCY - LLM First Token: ${performance.now() - this.time.input
                      }ms`,
                    );
                  }

                  partialMessage += delta;
                  this.dispatchEvent("ResponseTextDelta", { delta });
                }
              } catch (err) {
                console.error("Error parsing JSON:", err);
              }
            }
          }
        }
      }

      // Finalize
      if (this.isGeneratingResponse) {
        this.time.llm_done = performance.now();
        console.log(
          `📊 LATENCY - LLM Full Response Time: ${this.time.llm_done - this.time.llm
          }ms`,
        );
        console.log(
          `📊 LATENCY - LLM Response Rate: ~${Math.round(
            partialMessage.length /
            ((this.time.llm_done - this.time.llm) / 1000),
          )} chars/second`,
        );

        this.callConfig.chatHistory.addMessage("agent", partialMessage);
        this.dispatchEvent("ResponseTextDone", { text: partialMessage });
      }
    } catch (error) {
      console.error("Error in REST API request:", error);
    } finally {
      this.isGeneratingResponse = false;
    }
  }

  sendMessage(
    event: {
      type: string;
      item: {
        type: string;
        role: string;
        output?: string;
        content?: any;
        call_id?: string;
      };
    },
    isResponse = true,
  ) {
    if (this.isUsingRestApi) {
      console.log("sendMessage called but ignored in REST API mode");
      return;
    }

    this.send(JSON.stringify(event));
    if (isResponse) {
      this.send(JSON.stringify({ type: "response.create" }));
    }
  }
}

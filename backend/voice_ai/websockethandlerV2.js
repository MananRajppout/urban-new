const { GptService } = require("./services/gpt-service-v2");
const { GptJSONService } = require("./services/gpt-service-json");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");
const { recordingService } = require("./services/recording-service");
const { AiAgent } = require("./model");
const {
  setup_call_opening_system_prompt,
  setup_system_prompt,
  setup_call_details,
} = require("./constants");

module.exports.handleTelnyxConnectionV2 = (ws, req, res) => {
  try {
    ws.on("error", console.error);
    // Filled in from start message
    let streamSid;
    let callSid;

    const gptService = new GptService();
    const gptJsonService = new GptJSONService();
    const streamService = new StreamService(ws);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});

    // Function to find the AI agent
    async function findAiAgent(callFrom, callTo) {
      let aiAgent = null;

      aiAgent = await AiAgent.findOne({ twilio_phone_number: callTo });
      if (!aiAgent) {
        aiAgent = await AiAgent.findById(callFrom);
      }

      if (!aiAgent) {
        console.error("Error finding AI agent:");
        aiAgent = await AiAgent.findById("66b93a1e47760fc1cb7cc394");
      }

      return aiAgent;
    }

    // Function to start recording and TTS generation
    async function startRecordingAndTTS(streamSid, callSid) {
      try {
        await recordingService(ttsService, callSid, true);
        console.log(
          `Telnyx -> Starting Media Stream for ${streamSid}`.underline.red
        );
      } catch (error) {
        console.error("Error starting recording and TTS:", error);
      }
    }

    let marks = [];
    let interactionCount = 0;

    ws.on("telnyx.notification", (notification) => {
      console.log("\ntelnyx.notification", notification);
    });

    // Incoming from MediaStream
    ws.on("message", async function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === "start") {
        // console.log("Websocket Started: ", msg);
        streamSid = msg.stream_id;
        callSid = msg.start.call_control_id;

        // Extract `from` and `to` values without the '@sip' part.
        const callFrom = msg.start.from.split("@")[0]; // Removes '@sip.telnyx.eu' part
        const callTo = msg.start.to.split("@")[0]; // Removes '@sip.telnyx.com' part

        let aiAgent = await findAiAgent(callFrom, callTo);

        const transferNumber = aiAgent?.transfer_call_number;
        const voiceTemperature = 0.3;
        const voiceId = aiAgent?.voice_id;

        ttsService.setVoiceId(voiceId);
        // Set stream and call information
        streamService.setStreamSid(streamSid);

        // Start recording and TTS generation
        await startRecordingAndTTS(streamSid, callSid);

        // Construct the Call Opening system prompt based on the AI agent's configuration.
        const welcome_prompt = setup_call_opening_system_prompt(aiAgent);
        gptService.setCallInfo(welcome_prompt, voiceTemperature);

        gptService.completion(
          undefined,
          interactionCount,
          "assistant",
          "user",
          false
        );

        // Construct the system prompt based on the AI agent's configuration.
        // const systemPrompt =
        //   setup_system_prompt(aiAgent) +
        //   setup_call_details(callSid, transferNumber);

        setImmediate(() => {
          console.log("setting up new system prompt");
          const systemPrompt = setup_system_prompt(aiAgent);
          gptJsonService.setTransferCallInfo(callSid, transferNumber);
          gptJsonService.setCallInfo(systemPrompt, voiceTemperature);
        });
        //================
      } else if (msg.event === "media") {
        if (msg.media.track === "inbound") {
          transcriptionService.send(msg.media.payload);
        }
      } else if (msg.event === "mark") {
        const label = msg.mark.name;
        // console.log(msg);
        console.log(
          `Telnyx -> Audio completed mark (${msg.sequence_number}): ${label}`
            .red
        );
        marks = marks.filter((m) => m !== msg.mark.name);
      } else if (msg.event === "stop") {
        console.log(`Telnyx -> Media stream ${streamSid} ended.`.underline.red);
      }
    });

    transcriptionService.on("utterance", async (text) => {
      if (marks.length > 0 && text?.length > 5) {
        console.log("Telnyx -> Interruption, Clearing stream".red);
        ws.send(
          JSON.stringify({
            streamSid,
            event: "clear",
          })
        );
      }
    });

    transcriptionService.on("transcription", async (text) => {
      if (!text) {
        return;
      }
      console.log(
        `Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow
      );
      gptJsonService.completionJSON(text, interactionCount);
      interactionCount += 1;
    });

    gptService.on("gptreply", async (gptReply, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generate(gptReply, icount);
    });

    gptJsonService.on("gptreply", async (gptReply, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generate(gptReply, icount);
    });

    ttsService.on("speech", (responseIndex, audio, label, icount) => {
      console.log(`Interaction ${icount}: TTS -> Telnyx: ${label}`.blue);

      streamService.buffer(responseIndex, audio);
    });

    // ======== Specifically for Function Calls - To Make sure proper response is sent to the user =====

    gptJsonService.on("funcgptreply", async (gptReply, funcData, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generateWithFuncCall(gptReply, funcData, icount);
    });

    ttsService.on(
      "funcspeech",
      (responseIndex, audio, label, funcData, icount) => {
        console.log(`Interaction ${icount}: TTS -> Telnyx: ${label}`.blue);

        streamService.buffer(responseIndex, audio);
        setImmediate(() => {
          gptJsonService
            .validateAndCallJSONFunction(funcData)
            .then(() => {
              console.log("Function Call Completed");
            })
            .catch(() => {
              console.log("Function Call Failed");
            });
        });
      }
    );

    // ======== Specifically for Function Calls

    streamService.on("audiosent", (markLabel) => {
      marks.push(markLabel);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.handleAudioStreamingTest = (ws) => {
  try {
    ws.on("error", console.error);
    // Filled in from start message
    let streamSid;
    let callSid;

    const gptService = new GptService();
    const gptJsonService = new GptJSONService();
    const streamService = new StreamService(ws);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});

    let marks = [];
    let interactionCount = 0;

    // Incoming from MediaStream
    ws.on("message", async function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === "start") {
        console.log("Websocket Started: ", msg);
        streamSid = msg.stream_id;
        callSid = "1231";

        const transferNumber = "123141211";
        const voiceTemperature = 0.3;
        const voiceId = "aura-asteria-en";

        ttsService.setVoiceId(voiceId);
        // Set stream and call information
        streamService.setStreamSid(streamSid);

        // Construct the Call Opening system prompt based on the AI agent's configuration.
        const welcome_prompt = setup_call_opening_system_prompt({});
        console.log(welcome_prompt);
        gptService.setCallInfo(welcome_prompt, voiceTemperature);

        gptService.completion(
          undefined,
          interactionCount,
          "assistant",
          "user",
          false
        );

        // Construct the system prompt based on the AI agent's configuration.
        // const systemPrompt =
        //   setup_system_prompt({}) + setup_call_details(callSid, transferNumber);

        setImmediate(() => {
          console.log("setting up new system prompt");
          const systemPrompt = setup_system_prompt({});
          gptJsonService.setTransferCallInfo(callSid, transferNumber);
          gptJsonService.setCallInfo(systemPrompt, voiceTemperature);
        });
      } else if (msg.event === "media") {
        if (msg.media.track === "inbound") {
          // transcriptionService.send(msg.media.payload);
          await gptJsonService.completionJSON(
            msg.media.payload,
            interactionCount
          );
          interactionCount += 1;
        }
      } else if (msg.event === "mark") {
        const label = msg.mark.name;
        // console.log(msg);
        console.log(
          `Telnyx -> Audio completed mark (${msg.sequence_number}): ${label}`
            .red
        );
        marks = marks.filter((m) => m !== msg.mark.name);
      } else if (msg.event === "stop") {
        console.log(`Telnyx -> Media stream ${streamSid} ended.`.underline.red);
      }
    });

    transcriptionService.on("utterance", async (text) => {
      if (marks.length > 0 && text?.length > 5) {
        console.log("Telnyx -> Interruption, Clearing stream".red);
        ws.send(
          JSON.stringify({
            streamSid,
            event: "clear",
          })
        );
      }
    });

    transcriptionService.on("transcription", async (text) => {
      if (!text) {
        return;
      }
      console.log(
        `Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow
      );
      gptJsonService.completionJSON(text, interactionCount);
      interactionCount += 1;
    });

    gptService.on("gptreply", async (gptReply, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generate(gptReply, icount);
    });

    gptJsonService.on("gptreply", async (gptReply, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generate(gptReply, icount);
    });

    ttsService.on("speech", (responseIndex, audio, label, icount) => {
      console.log(`Interaction ${icount}: TTS -> Telnyx: ${label}`.blue);

      streamService.buffer(responseIndex, audio);
    });

    // ======== Specifically for Function Calls - To Make sure proper response is sent to the user =====

    gptJsonService.on("funcgptreply", async (gptReply, funcData, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generateWithFuncCall(gptReply, funcData, icount);
    });

    ttsService.on(
      "funcspeech",
      (responseIndex, audio, label, funcData, icount) => {
        console.log(`Interaction ${icount}: TTS -> Telnyx: ${label}`.blue);

        streamService.buffer(responseIndex, audio);
        setImmediate(() => {
          gptJsonService
            .validateAndCallJSONFunction(funcData)
            .then(() => {})
            .catch(() => {});
        });
      }
    );

    // ======== Specifically for Function Calls

    streamService.on("audiosent", (markLabel) => {
      marks.push(markLabel);
    });
  } catch (err) {
    console.log(err);
  }
};

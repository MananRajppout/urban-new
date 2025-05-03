const { GptService } = require("./services/gpt-service");
const { StreamService } = require("./services/stream-service");
const { TranscriptionService } = require("./services/transcription-service");
const { TextToSpeechService } = require("./services/tts-service");
const { recordingService } = require("./services/recording-service");
const { AiAgent, TwilioPhoneRecord, CallHistory } = require("./model");
const {
  createCallHistory,
  createCallSessionLogs,
  getVoiceRespUrl,
  createTwilioCallRecording,
  handleReminders,
  handleCallTransfer,
  generateSystemPrompt,
} = require("./impl");
const axios = require("axios");

const { getCurrentTime } = require("../utils/infra");

module.exports.handleTelnyxConnection = (ws, req, res) => {
  try {
    ws.on("error", console.error);
    // Filled in from start message
    let streamSid;
    let callSid;

    const gptService = new GptService();
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
        console.error("Error finding AI agent:", e3);
        aiAgent = await AiAgent.findById("66b93a1e47760fc1cb7cc394");
      }

      return aiAgent;
    }

    // Function to start recording and TTS generation
    async function startRecordingAndTTS(streamSid, callSid, welcomeMsg) {
      try {
        await recordingService(ttsService, callSid, true);
        console.log(
          `Telnyx -> Starting Media Stream for ${streamSid}`.underline.red
        );
        ttsService.generate(
          {
            partialResponseIndex: null,
            partialResponse: welcomeMsg,
          },
          0
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

        // Construct the system prompt based on the AI agent's configuration.
        const systemPrompt = generateSystemPrompt(aiAgent);
        const welcomeMsg = aiAgent?.welcome_msg
          ? aiAgent.welcome_msg
          : "Hello, how are you ?";
        const transferNumber = aiAgent?.transfer_call_number;
        const voiceTemperature = aiAgent?.voice_temperature;
        const voiceId = aiAgent?.voice_id;

        // Set stream and call information
        streamService.setStreamSid(streamSid);
        gptService.setCallInfo(
          systemPrompt,
          welcomeMsg,
          callSid,
          transferNumber,
          voiceTemperature
        );
        ttsService.setVoiceId(voiceId);

        // Start recording and TTS generation
        await startRecordingAndTTS(streamSid, callSid, welcomeMsg);
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
      gptService.completion(text, interactionCount);
      interactionCount += 1;
    });

    gptService.on("gptreply", async (gptReply, icount) => {
      console.log(
        `Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green
      );
      ttsService.generate(gptReply, icount);
    });

    ttsService.on("speech", (responseIndex, audio, label, icount) => {
      console.log(`Interaction ${icount}: TTS -> Telnyx: ${label}`.blue);

      streamService.buffer(responseIndex, audio);
    });

    streamService.on("audiosent", (markLabel) => {
      marks.push(markLabel);
    });
  } catch (err) {
    console.log(err);
  }
};

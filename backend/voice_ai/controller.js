require("dotenv").config();
const { twiml } = require("twilio");
const catchAsyncError = require("../middleware/catchAsyncError");
const { AiAgent, TwilioPhoneRecord, CallHistory } = require("./model");
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid"); // For generating unique file names
const twilio = require("twilio");
const { PhoneNumberUtil, PhoneNumberFormat } = require("google-libphonenumber");
const {
  createCallHistory,
  createCallSessionLogs,
  getVoiceRespUrl,
  createTwilioCallRecording,
  handleReminders,
  handleCallTransfer,
  generateSystemPrompt,
} = require("./impl");
const { getCurrentTime } = require("../utils/infra");
const BookingHandler = require("./booking_handler");
const { getPricingForCall } = require("../pricing/voice_ai_cost_cal");
const ElevenLabsVoiceHelper = require("./elevenlabs");
const DeepGramVoiceHelper = require("./deepgram");
const { getSarvamVoices, getSmallestVoices } = require("../v2/utils");
const dayjs = require("dayjs");
const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const {
  getVoiceAIStats,
  getCallActivityChartData,
  getRecentCalls,
  getChatbotDashboardStats,
  getMessageActivityChartData,
  getPeakMessageTimes,
  getUniqueVisitors,
  getRecentMessages,
  getCallsBySourceOverTime,
} = require("./stats_service");
const { AccessToken:LivekitAccessToken } = require("livekit-server-sdk");

const { Restriction, User } = require("../user/model");
const {
  generatePrereordedAudio,
} = require("../services/elevenlabs.service.js");
const {
  generatePrereordedAudioSmallestAI,
} = require("../services/smallestai.service.js");
const { destryFromCloudinary } = require("../services/cloudinary.service.js");
const {
  generatePrereordedAudioSarvamAI,
} = require("../services/sarmavai.service.js");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel.js");

const phoneUtil = PhoneNumberUtil.getInstance();

const openai = new OpenAI({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: "sk-proj-lQls5CirWlD8oi7lQVRzT3BlbkFJWnSOCJbrPd5IjpZeTqcu",
});

const twilioClient = new twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_SECRET_KEY
);


//=================================LIVEKIT=================================
const livekit_api_key = process.env.LIVEKIT_API_KEY;
const livekit_api_secret = process.env.LIVEKIT_API_SECRET;

function generateRandomAlphanumeric(length) {
  const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const generateToken = (userInfo, grant) => {
  const at = new LivekitAccessToken(livekit_api_key, livekit_api_secret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

exports.generateLivekitToken = catchAsyncError(async (req, res, next) => {
  const { metadata } = req.body;
  const roomName = `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;

  // Get participant name from query params or generate random one
  const identity = `identity-${generateRandomAlphanumeric(4)}`;

  const grant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
  };

  const token = await generateToken({ identity,metadata:JSON.stringify(metadata)}, grant);
  const result = {
        identity,
        accessToken: token,
  };

  res.status(200).json(result);
});

//=================================LIVEKIT=================================


exports.handleTwilioCallRequest = catchAsyncError(async (req, res, next) => {
  const voiceResponse = new twiml.VoiceResponse();
  const cookies = req.cookies;

  // Determine the type of call and retrieve the relevant phone number.
  const callType = req.query.calltype || "ph-inbound";

  let aiAgent;
  if (callType === "web-inbound") {
    // Fetch the AI agent model associated with the agent ID.
    const aiAgentId = req.body.To;
    aiAgent = await AiAgent.findById(aiAgentId);
  } else {
    // Fetch the AI agent model associated with the phone number.
    const queryPhoneNumber =
      callType === "ph-outbound" ? req.body.From : req.body.Called;
    aiAgent = await AiAgent.findOne({ twilio_phone_number: queryPhoneNumber });
  }

  // Check if session cookies exist; if not, set up a new session.
  if (!cookies || !cookies.messages) {
    const callerId = req.body.CallSid;
    console.log("generating audio file");

    // Generate the URL for the welcome message audio file.
    const publicAudioFileUrl = await getVoiceRespUrl(
      aiAgent?.welcome_msg,
      aiAgent
    );

    // Construct the system prompt based on the AI agent's configuration.
    const systemPrompt = generateSystemPrompt(aiAgent);

    // Set cookies to maintain session state across requests.
    res.cookie(
      "messages",
      JSON.stringify([
        { role: "system", content: systemPrompt },
        { role: "assistant", content: aiAgent?.welcome_msg },
      ])
    );

    res.cookie(
      "chatbot_configuration",
      JSON.stringify({
        user_id: aiAgent?.user_id,
        chatgpt_model: aiAgent?.chatgpt_model,
        voice_id: aiAgent?.voice_id,
        transfer_call_number: aiAgent?.transfer_call_number,
        cal_api_key: aiAgent?.cal_api_key,
        cal_event_type_id: aiAgent?.cal_event_type_id,
        cal_timezone: aiAgent?.cal_timezone,
        voice_engine_name: aiAgent?.voice_engine_name,
        ambient_sound: aiAgent?.ambient_sound,
        voice_speed: aiAgent?.voice_speed,
        temperature: aiAgent?.voice_temperature,
        ambient_sound_volume: aiAgent?.ambient_sound_volume,
        responsiveness: aiAgent?.responsiveness,
        reminder_interval: aiAgent?.reminder_interval,
        reminder_count: aiAgent?.reminder_count,
        ambient_sound_volume: aiAgent?.ambient_sound_volume,
        language_code: aiAgent?.language,
        end_call_duration: aiAgent?.end_call_duration,
        fallback_voice_ids: aiAgent?.fallback_voice_ids,
        CalenderTool: {
          cal_api_key: aiAgent?.calendar_tools[0]?.cal_api_key,
          cal_event_type_id: aiAgent?.calendar_tools[0]?.cal_event_type_id,
          cal_timezone: aiAgent?.calendar_tools[0]?.cal_timezone,
        },
      })
    );

    res.cookie("reminder_curr_count", 0);
    res.cookie("caller_id", callerId);
    res.cookie("current_time", Date.now());

    // Pause before playing the welcome message, adjusted by the AI agent's responsiveness.
    voiceResponse.pause({
      length: 5.0 * (1.0 - aiAgent?.responsiveness),
    });

    //play the generated audio file
    await voiceResponse.play(publicAudioFileUrl);

    // Log call history and session data (commented out for now).
    // const currentTime = getCurrentTime();
    // createCallHistory({ caller_id: callerId, start_time: currentTime, calltype: callType, from_phone_number: req.body.From }, aiAgent);
    // createCallSessionLogs({ caller_id: callerId, created_time: currentTime, ai_reply_text: aiAgent?.welcome_msg, ai_reply_voice_url: publicAudioFileUrl, user_id: aiAgent?.user_id });

    // voiceResponse.record({
    // 		playBeep:false,
    // 		recordingStatusCallback: '/api/twilio-recording-events', // Replace with your endpoint to handle recording
    // 		recordingStatusCallbackMethod: 'POST',
    // 		recordingStatusCallbackEvent : ['completed']
    // 	});
  }

  // Configure the voice response to gather speech input.
  voiceResponse.gather({
    input: ["speech"],
    speechModel: "experimental_conversations",
    speechTimeout: "auto",
    enhanced: false,
    bargeIn: true,
    action: "/api/respond",
  });

  // Send the generated TwiML response back to Twilio.
  res.setHeader("Content-Type", "application/xml");
  res.send(voiceResponse.toString());
  // await createTwilioCallRecording(twilioClient, req.body.CallSid, req.get('host'))
});

exports.twilioCallRespond = catchAsyncError(async (req, res) => {
  const formData = req.body;
  const userVoiceInput = formData.SpeechResult
    ? formData.SpeechResult.toString()
    : "";

  // Retrieve conversation history and AI agent configuration from cookies
  let conversationHistory = JSON.parse(req.cookies.conversationHistory || "[]");
  let aiAgentConfig = JSON.parse(req.cookies.chatbot_configuration || "{}");
  let bookingDetails = JSON.parse(req.cookies.bookingDetails || "{}");
  let startingTime = req.cookies.current_time || "";
  const timeout = (Date.now() - startingTime) / 1000;

  console.log("Timeout : ", timeout);
  // End Call if the user stays silent for the specified time
  if (!userVoiceInput && timeout >= aiAgentConfig?.end_call_duration) {
    // Handle timeout (silence case)
    const msg = "Sorry, there was no input detected. Ending the call now.";
    const publicAudioFileUrl = await getVoiceRespUrl(msg, aiAgentConfig);
    const voiceResponse = new twiml.VoiceResponse();
    voiceResponse.play(publicAudioFileUrl);
    voiceResponse.hangup(); // End the call
    return res
      .setHeader("Content-Type", "application/xml")
      .send(voiceResponse.toString());
  }

  // Get current reminder count and maximum allowed reminders
  const currentReminderCount =
    parseInt(req.cookies.reminder_curr_count, 10) || 0;
  const maxReminderLimit = aiAgentConfig.reminder_count || 3;

  /**
   * Handles the reminder logic when the user provides no voice input.
   * If the user remains silent or the input is empty, the reminder count increases.
   * If the reminder count exceeds the maximum limit, the call is ended.
   */
  const reminderResult = handleReminders(
    userVoiceInput,
    currentReminderCount,
    maxReminderLimit,
    res
  );
  if (reminderResult.shouldEndCall) {
    return res.send(reminderResult.responseXml);
  }

  // Append the user's voice input to the conversation history
  conversationHistory.push({ role: "user", content: userVoiceInput });

  // Handle call transfer if requested by the user
  if (handleCallTransfer(userVoiceInput, aiAgentConfig, res)) {
    return; // Call transfer was handled, exit the function
  }

  // Handle Bookings if requested by the user
  const bookingHandler = new BookingHandler(
    userVoiceInput,
    bookingDetails,
    aiAgentConfig,
    res,
    conversationHistory
  );
  try {
    const bookingParsingPrompt = `
			You are an intelligent assistant. Analyze the following input and determine if the user wants to book or schedule a meeting.
			Input: "${userVoiceInput}"
			Respond only with "Yes" if the user wants to book or schedule a meeting. Respond with "No" if they do not want to book or schedule a meeting. Do not include any additional text.
			`;
    const chatCompletionBooking = await openai.chat.completions.create({
      model: aiAgentConfig.chatgpt_model,
      messages: [{ role: "system", content: bookingParsingPrompt }],
      temperature: aiAgentConfig.temperature,
    });
    const bookingResponse = chatCompletionBooking.choices[0].message.content;
    console.log("bookresponse", bookingResponse);
    if (bookingDetails.stage || bookingResponse.toLowerCase() == "yes") {
      return await bookingHandler.handle();
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ message: "Something went wrong" });
  }

  try {
    // Generate a response from the AI model based on conversation history
    const chatResponse = await openai.chat.completions.create({
      model: aiAgentConfig.chatgpt_model,
      messages: conversationHistory,
      temperature: aiAgentConfig.temperature,
    });
    const assistantReply = chatResponse.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: assistantReply });
    res.cookie("messages", JSON.stringify(conversationHistory));
    res.cookie("conversationHistory", JSON.stringify(conversationHistory));

    console.log("response : ", assistantReply);
    // Generate the URL for the assistant's audio response
    const audioFileUrl = await getVoiceRespUrl(assistantReply, aiAgentConfig);

    // Create a Twilio voice response to play the assistant's audio and gather further user input
    const voiceResponse = new twiml.VoiceResponse();
    voiceResponse.pause({
      length: 5.0 * (1.0 - aiAgentConfig.responsiveness),
    });

    await voiceResponse.play(audioFileUrl); // Play the synthesized audio response

    const gather = voiceResponse.gather({
      input: ["speech"],
      speechModel: "experimental_conversations",
      speechTimeout: "auto",
      enhanced: true,
      action: "/api/respond",
    });

    res.cookie("current_time", Date.now());
    // Redirect to handle subsequent user input
    voiceResponse.redirect({ method: "POST" }, "/api/respond");

    res.setHeader("Content-Type", "application/xml");
    res.send(voiceResponse.toString());

    // Log call session details for tracking and analysis
    const currentTime = getCurrentTime();
    createCallSessionLogs({
      caller_id: req.cookies.caller_id,
      created_time: currentTime,
      ai_reply_text: assistantReply,
      ai_reply_voice_url: audioFileUrl,
      user_id: aiAgentConfig.user_id,
      user_msg: userVoiceInput,
    });
  } catch (err) {
    console.error("Error occurred:", err);
    res
      .status(500)
      .json({ message: "An error occurred while processing the request." });
  }
});

// Helper function to format phone number
function formatPhoneNumberPretty(phoneNumber, country) {
  const number = phoneUtil.parseAndKeepRawInput(phoneNumber, country);
  return phoneUtil.format(number, PhoneNumberFormat.NATIONAL);
}

// Create a new AI agent
exports.createAIAgent = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.id;
  const { agent_type = "single_prompt", nodes = [] } = req.body;

  const aiAgentPayload = {
    ...req.body,
    user_id,
    name: "UrbanChat Assistant",
    agent_type: ["single_prompt", "multi_flow"].includes(agent_type)
      ? agent_type
      : "single_prompt",
  };

  console.log("Generating... prerecorded audio.");
  const text = "Hello' How can i assist you today.";
  const voice_id = req.body.voice_id;
  const voice_speed = req.body.voice_speed;
  const voice_engine_name = req.body.voice_engine_name;

  let generateAudioResponse;
  if (voice_engine_name == "elevenlabs") {
    generateAudioResponse = await generatePrereordedAudio({ text, voice_id });
  } else if (voice_engine_name == "smallest") {
    generateAudioResponse = await generatePrereordedAudioSmallestAI({
      text,
      voice_id,
      voice_speed,
    });
  } else if (voice_engine_name == "sarvam") {
    generateAudioResponse = await generatePrereordedAudioSarvamAI({
      text,
      voice_id,
    });
  } else {
    generateAudioResponse = await generatePrereordedAudioSmallestAI({
      text,
      voice_id,
      voice_speed,
    });
  }

  console.log("prerecorded audio. generated", generateAudioResponse);
  aiAgentPayload.welcome_message_file = generateAudioResponse;

  if (agent_type === "multi_flow") {
    // Save nodes to database
    const savedNodes = await Node.insertMany(nodes);
    aiAgentPayload.nodes = savedNodes.map((node) => node._id);
  }

  const aiAgent = await AiAgent.create(aiAgentPayload);
  res.status(201).json({ success: true, data: aiAgent });
});

// Create AI agent

exports.fetchAIAgents = catchAsyncError(async (req, res, next) => {
  const userId = req.user.id;

  const aiAgents = await AiAgent.find({ user_id: userId });

  if (!aiAgents) {
    return res.status(404).json({
      success: false,
      message: "No AI agents found for this user",
    });
  }

  res.status(200).json({
    success: true,
    message: "AI agents fetched successfully",
    ai_agents: aiAgents,
  });
});

exports.fetchSingleAiAgent = catchAsyncError(async (req, res, next) => {
  const agentId = req.params.agent_id;

  let aiAgent = await AiAgent.findOne({ _id: agentId });
  

  if (!aiAgent) {
    return res.status(404).json({
      success: false,
      message: "No AI Agent found",
    });
  }

  const user = await User.findById(aiAgent.user_id);
  aiAgent = JSON.parse(JSON.stringify(aiAgent))
  if(user.elevenlabs_api_key){
    aiAgent["elevenlabs_api_key"] = user.elevenlabs_api_key
  }
  
  res.status(200).json({
    success: true,
    message: "AI agent fetched successfully",
    ai_agents: aiAgent,
  });
});



exports.fetchSingleAiAgentForLivekit = catchAsyncError(async (req, res, next) => {
  const agentId = req.params.agent_id;

  let aiAgent = await AiAgent.findOne({ _id: agentId });
  

  if (!aiAgent) {
    return res.status(404).json({
      success: false,
      message: "No AI Agent found",
    });
  }

  const user = await User.findById(aiAgent.user_id);
  aiAgent = JSON.parse(JSON.stringify(aiAgent))
  if(user.elevenlabs_api_key){
    aiAgent["elevenlabs_api_key"] = user.elevenlabs_api_key
  }

  const restriction = await Restriction.findOne({id: user._id});

  const remainingMinutes = Math.max(0,restriction.voice_trial_minutes_limit - restriction.voice_trial_minutes_used);
  
  if(remainingMinutes <= 0){
    user.voice_ai_status = "inactive";
    user.is_active = false;
    await user.save();
    return res.status(401).json({
      success: false,
      message: "No Minutes left",
    });
  }
  
  res.status(200).json({
    success: true,
    message: "AI agent fetched successfully",
    ai_agents: aiAgent,
  });
});

// Update an existing AI agent
exports.updateAIAgent = catchAsyncError(async (req, res, next) => {
  const { agent_id } = req.params;

  //============================transform voice speed formula added here test it by aayush===============
  const update = { ...req.body };
  const agent = await AiAgent.findOne({ _id: agent_id });

  if (!agent) {
    return res
      .status(404)
      .json({ message: "AI agent not found", success: false });
  }

  if (req.body.voice_speed !== undefined) {
    update.voice_speed =
      req.body.voice_speed >= 1
        ? req.body.voice_speed
        : 0.7 + req.body.voice_speed * 0.3;
  }

  //generate prerecorded audio for welcome message
  const shouldUpdateText =
    update.welcome_message_text !== undefined &&
    update.welcome_message_text !== agent.welcome_message_text;

  const shouldUpdateVoice =
    update.voice_id !== undefined && update.voice_id !== agent.voice_id;

  const shouldUpdateSpeed =
    update.voice_speed !== undefined &&
    update.voice_speed !== agent.voice_speed;

  const shouldUpdateVoiceEngine =
    update.voice_engine_name !== undefined &&
    update.voice_engine_name !== agent.voice_engine_name;

  // if (shouldUpdateText || shouldUpdateVoice || shouldUpdateSpeed || shouldUpdateVoiceEngine) {

  //   if (agent.welcome_message_file?.publid_id) {
  //     console.log("deleting... previos recording");
  //     await destryFromCloudinary(agent.welcome_message_file?.publid_id);
  //     console.log("previos recording deleted.");
  //   }

  //   const text = update.welcome_message_text || agent.welcome_message_text;
  //   const voice_id = update.voice_id || agent.voice_id;
  //   const voice_speed = update.voice_speed || agent.voice_speed;
  //   const voice_engine_name = update.voice_engine_name || agent.voice_engine_name;
  //   console.log("Generating... prerecorded audio.",voice_engine_name);

  //   let generateAudioResponse;
  //   if (voice_engine_name == "elevenlabs") {
  //     generateAudioResponse = await generatePrereordedAudio({ text, voice_id });
  //   } else if (voice_engine_name == "smallest") {
  //     generateAudioResponse = await generatePrereordedAudioSmallestAI({ text, voice_id, voice_speed });
  //   } else if (voice_engine_name == "sarvam") {
  //     generateAudioResponse = await generatePrereordedAudioSarvamAI({ text, voice_id });
  //   } else {
  //     generateAudioResponse = await generatePrereordedAudioSmallestAI({ text, voice_id, voice_speed });
  //   }

  //   console.log("prerecorded audio. generated", generateAudioResponse);
  //   update.welcome_message_file = generateAudioResponse;
  // }

  const updatedAgent = await AiAgent.findOneAndUpdate(
    { _id: agent_id },
    { $set: update },
    { new: true, runValidators: true }
  );
  if (!updatedAgent) {
    return res
      .status(404)
      .json({ message: "AI agent not found", success: false });
  }

  res.status(200).json({
    success: true,
    message: "AI agent updated successfully",
    aiAgent: updatedAgent,
  });
});

// Delete an existing AI agent
exports.deleteAiAgent = catchAsyncError(async (req, res) => {
  // Trim any whitespace from the ID parameter
  const id = req.params.id.trim();

  try {
    // Check if the agent exists
    const agent = await AiAgent.findById(id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "AI Agent not found",
      });
    }

    // Check if the user has permission to delete this agent
    if (agent.user_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this AI Agent",
      });
    }

    // Delete the agent
    await AiAgent.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "AI Agent deleted successfully",
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid AI Agent ID format",
      });
    }

    // Re-throw other errors to be caught by the global error handler
    throw error;
  }
});

exports.fetchPhoneNumbers = catchAsyncError(async (req, res, next) => {
  const phone_numbers = await TwilioPhoneRecord.find({ user_id: req.user.id });
  res.status(200).json({
    success: true,
    phone_numbers,
  });
});

// WARNING: PLEASE NOT TEST THIS API WITH LIVE CREDENTIAL OTHERWISE PAYMENT WILL CHARGED FROM TWILIO ACCOUNT!
exports.buyPhoneNumber = catchAsyncError(async (req, res, next) => {
  try {
    const { country = "US", twilio_number } = req.body;
    const user_id = req.user.id;

    let purchasedNumber;

    if (twilio_number) {
      // Validate the provided phone number
      // const number = phoneUtil.parseAndKeepRawInput(twilio_number, country);
      // if (!phoneUtil.isValidNumberForRegion(number, country)) {
      // 	return res
      // 		.status(400)
      // 		.json({ success:false, message: "Invalid phone number for the specified country" });
      // }

      // validate if number already exists in database
      const numberAlreadyPurchased = await TwilioPhoneRecord.findOne({
        user_id: user_id,
        twilio_phone_number: twilio_number,
      });

      if (numberAlreadyPurchased) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already purchased",
        });
      }

      const phoneNumberPretty = formatPhoneNumberPretty(twilio_number, country);

      // Use provided phone number if available
      purchasedNumber = await TwilioPhoneRecord.create({
        user_id: user_id,
        twilio_phone_number: twilio_number,
        phone_number_pretty: phoneNumberPretty,
        country: country,
      });
    } else {
      // Find available phone numbers
      let availablePhoneNumbers;
      try {
        availablePhoneNumbers = await twilioClient
          .availablePhoneNumbers(country)
          .local.list({ limit: 1 });
      } catch (err) {
        console.log("error", err.message);
        return res.status(404).json({
          success: false,
          message:
            "No available phone numbers found, try using different country",
        });
      }

      // Purchase the first available phone number
      const twilioPhoneNumber = await twilioClient.incomingPhoneNumbers.create({
        // USE THIS MAGIC NUMBER FOR TESTING - magicNumber = "+15005550006" REPLACE IT WITH availablePhoneNumbers[0].phoneNumber
        phoneNumber: availablePhoneNumbers[0].phoneNumber,
        voiceUrl: "https://" + req.get("host") + "/api/incoming-call", // voice url
      });

      const phoneNumberPretty = formatPhoneNumberPretty(
        twilioPhoneNumber.phoneNumber,
        country
      );

      purchasedNumber = await TwilioPhoneRecord.create({
        user_id: user_id,
        twilio_phone_number: twilioPhoneNumber.phoneNumber,
        phone_number_pretty: phoneNumberPretty,
        country: country,
        twilio_sid: twilioPhoneNumber.sid,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Phone number Added successfully",
      phoneNumber: purchasedNumber.twilio_phone_number,
      phoneNumberPretty: purchasedNumber.phone_number_pretty,
      country: purchasedNumber.country,
    });
  } catch (error) {
    console.error("Error purchasing phone number:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

exports.fetchSinglePhoneNumber = catchAsyncError(async (req, res, next) => {
  const phoneRecord = await TwilioPhoneRecord.findOne({
    _id: req.params.ph_id,
  });
  const AiAgentRecord = await AiAgent.findOne({
    twilio_phone_number: phoneRecord.twilio_phone_number,
  });
  console.log("ai agent record", AiAgentRecord);

  const response = {
    ...phoneRecord.toObject(),
  };

  if (AiAgentRecord?.twilio_phone_number) {
    response.agent_id = AiAgentRecord._id;
    response.agent_name = AiAgentRecord.name;
  }

  res.status(200).json({
    success: true,
    phone_number: response,
  });
});

exports.updatePhoneNumber = catchAsyncError(async (req, res, next) => {
  const { phone_number_id } = req.params;
  const updateFields = req.body;
  const { agent_id } = updateFields;

  // Find the current phone record before update
  const currentPhoneRecord = await TwilioPhoneRecord.findById(phone_number_id);
  if (!currentPhoneRecord) {
    return res.status(404).json({
      success: false,
      message: "Phone record not found",
    });
  }

  // Clear the twilio_phone_number from any other agent record
  const twilioPhoneNumber = currentPhoneRecord.twilio_phone_number;
  const [previousAgent, updatedPhoneRecord] = await Promise.all([
    AiAgent.findOneAndUpdate(
      { twilio_phone_number: twilioPhoneNumber },
      { $unset: { twilio_phone_number: "" } },
      { new: true }
    ),
    TwilioPhoneRecord.findByIdAndUpdate(
      phone_number_id,
      { $set: updateFields },
      { new: true }
    ),
  ]);

  // Update the agent's twilio_phone_number in AiAgent schema
  let updatedAgent = null;
  if (twilioPhoneNumber) {
    updatedAgent = await AiAgent.findByIdAndUpdate(
      agent_id,
      { $set: { twilio_phone_number: twilioPhoneNumber } },
      { new: true }
    );
  }

  const response = {
    ...updatedPhoneRecord.toObject(),
    agent_id: updatedAgent ? updatedAgent._id : null,
    agent_name: updatedAgent ? updatedAgent.name : null,
  };

  res.status(200).json({
    success: true,
    phone_number: response,
  });
});

exports.makeOutboundCall = catchAsyncError(async (req, res, next) => {
  const { to_phone_number, ai_agent_id } = req.query;
  const aiAgent = await AiAgent.findOne({ _id: ai_agent_id });
  if (!aiAgent) {
    return res
      .status(404)
      .json({ message: "AI agent not found", success: false });
  }

  const callbackUrl =
    "https://" +
    req.get("host") +
    "/api/twilio-call-handler?calltype=ph-outbound";
  await twilioClient.calls.create({
    from: aiAgent.twilio_phone_number,
    to: to_phone_number,
    url: callbackUrl,
  });

  return res.status(200).json({ message: "Call get initiated", success: true });
});

exports.deleteTwilioPhoneNumber = catchAsyncError(async (req, res, next) => {
  const { tw_ph_id } = req.params; // twilio phone record id
  const tw_ph = await TwilioPhoneRecord.findOne({
    _id: tw_ph_id,
    user_id: req.user.id,
  });

  if (!tw_ph) {
    return res.status(404).json({
      message: "Twilio phone record object not found",
      success: false,
    });
  }

  const tw_obj = await twilioClient
    .incomingPhoneNumbers(tw_ph.twilio_sid)
    .remove();
  await TwilioPhoneRecord.deleteOne({ _id: tw_ph.id }); // two step verification for deleting a number

  return res
    .status(200)
    .json({ message: "Phone number has been deleted", success: true });
});

exports.generateWebCallAccessToken = (req, res) => {
  // Twilio credentials
  const agent_id = req.query.agent_id;
  const accountSid = process.env.TWILIO_API_KEY;
  const apiKey = process.env.TWILIO_WEB_CALL_API_KEY;
  const apiKeySecret = process.env.TWILIO_WEB_CALL_API_SECRET;
  const twimlAppSid = process.env.TWILIO_WEB_CALL_SID;

  const identity = agent_id;

  const accessToken = new AccessToken(
    accountSid,
    apiKey,
    apiKeySecret,
    { identity },
    { ttl: 3600 }
  ); // Token time-to-live in seconds);

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twimlAppSid,
    incomingAllow: true,
  });
  accessToken.addGrant(voiceGrant);

  res.json({
    token: accessToken.toJwt(),
    identity: identity,
  });
};

// Twilio Recording Events
exports.twiRecEvents = catchAsyncError(async (req, res, next) => {
  res.status(200);

  const secondsToAdd = parseInt(req.body.RecordingDuration, 10);
  const histObj = await CallHistory.findOne({ caller_id: req.body.CallSid });
  const endTime = histObj.start_time + secondsToAdd * 1000;

  histObj.end_time = new Date(endTime);
  histObj.recording_url = req.body.RecordingUrl;
  histObj.recording_sid = req.body.RecordingSid;
  histObj.cost = await getPricingForCall(histObj);

  await histObj.save();
});

exports.twiTranscribeEvents = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
});

exports.fetchVoices = catchAsyncError(async (req, res) => {
  const elevenlabs = new ElevenLabsVoiceHelper();
  const deepgram = new DeepGramVoiceHelper();
  const elevenLabApiKey = req.user.elevenlabs_api_key;
  const elevenLabsVoices = await elevenlabs.fetchVoices(elevenLabApiKey);
  const deepgramVoices = await deepgram.fetchVoices();
  // const deepGramVoices = await deepgram.fetchVoices();
  // sarvam voices
  const sarvamVoices = await getSarvamVoices();
  const smallestVoices = await getSmallestVoices();

  return res.status(200).send({
    elevenlabs: elevenLabsVoices,
    deepgram: deepgramVoices,
    sarvam: sarvamVoices,
    smallest: smallestVoices,
  }); // add later deepgram: deepGramVoices
});

exports.fetchCallHistory = catchAsyncError(async (req, res) => {
  const userId = req.user._id;
  const callHistory = await CallHistory.find({ user_id: userId }).sort({
    created_time: -1,
  });

  if (!callHistory || callHistory.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No call history found for this user.",
    });
  }

  res.status(200).json({
    success: true,
    recordings: callHistory,
  });
});

exports.getSuperAdminDashboardData = catchAsyncError(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter;
  if (startDate && endDate) {
    dateFilter = { $gte: new Date(startDate), $lt: new Date(endDate) };
  } else {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    dateFilter = { $gte: start, $lte: end };
  }

  const callStats = await CallHistory.aggregate([
    {
      $match: {
        start_time: dateFilter
      },
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalDuration: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: [{ $type: "$start_time" }, "missing"] },
                  { $ne: [{ $type: "$end_time" }, "missing"] },
                ],
              },
              {
                $divide: [
                  { $subtract: ["$end_time", "$start_time"] },
                  60000, // Convert ms to minutes
                ],
              },
              0,
            ],
          },
        },
        inboundCalls: {
          $sum: {
            $cond: [{ $eq: ["$direction", "inbound"] }, 1, 0],
          },
        },
        outboundCalls: {
          $sum: {
            $cond: [{ $eq: ["$direction", "outbound"] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        averageDuration: {
          $cond: [
            { $eq: ["$totalCalls", 0] },
            0,
            { $divide: ["$totalDuration", "$totalCalls"] },
          ],
        },
      },
    },
  ]);

  const userStats = await User.aggregate([
    {
      $match: {
        created_time: dateFilter,
      },
    },
    {
      $group: {
        _id: null,
        totalSignUps: { $sum: 1 },
        paidCustomers: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $ne: ["$pricing_plan", null] },
                  { $gt: [{ $size: "$subscriptions" }, 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
        activeAccounts: {
          $sum: {
            $cond: [{ $eq: ["$is_active", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  const call = callStats[0] || {
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    inboundCalls: 0,
    outboundCalls: 0,
  };

  const user = userStats[0] || {
    totalSignUps: 0,
    paidCustomers: 0,
    activeAccounts: 0,
  };

  const combined = { ...call, ...user };

  const chartData = {
    callsBreakdown: {
      labels: ['Inbound', 'Outbound'],
      values: [call.inboundCalls, call.outboundCalls]
    },
    userConversion: {
      labels: ['Signups', 'Paid Customers'],
      values: [user.totalSignUps, user.paidCustomers]
    },
    generalStats: {
      labels: [
        'Total Calls',
        'Total Minutes',
        'Avg Call Duration',
        'Signups',
        'Paid Customers',
        'Active Accounts'
      ],
      values: [
        call.totalCalls,
        parseFloat(call.totalDuration.toFixed(2)),
        parseFloat(call.averageDuration.toFixed(2)),
        user.totalSignUps,
        user.paidCustomers,
        user.activeAccounts
      ]
    }
  };

  res.status(200).json({
    success: true,
    data: combined,
    chartData
  });
});


exports.getSuperAdminDeleteUser = catchAsyncError(async (req, res) => {
    const { id} = req.params;

    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "User deleted Successfully"

    });
});


// exports.getSuperAdminUserDashboardData = catchAsyncError(async (req, res) => {
//   const { startDate, endDate,user_id } = req.query;

//   let dateFilter;
//   if (startDate && endDate) {
//     dateFilter = {$gte:new Date(startDate),$lt:new Date(endDate)}
//   } else {
//     dateFilter = {$gte: new Date(), $lte: new Date()};
//   }


  

//     const callStats = await CallHistory.aggregate([
//       {
//         $match: {
//           user_id: user_id,
//           start_time: dateFilter
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalCalls: { $sum: 1 },
//           totalDuration: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $ne: [{ $type: "$start_time" }, "missing"] },
//                     { $ne: [{ $type: "$end_time" }, "missing"] },
//                   ],
//                 },
//                 {
//                   $divide: [
//                     { $subtract: ["$end_time", "$start_time"] },
//                     60000, // Convert ms to minutes
//                   ],
//                 },
//                 0,
//               ],
//             },
//           },
//           inboundCalls: {
//             $sum: {
//               $cond: [{ $eq: ["$direction", "inbound"] }, 1, 0],
//             },
//           },
//           outboundCalls: {
//             $sum: {
//               $cond: [{ $eq: ["$direction", "outbound"] }, 1, 0],
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           averageDuration: {
//             $cond: [
//               { $eq: ["$totalCalls", 0] },
//               0,
//               { $divide: ["$totalDuration", "$totalCalls"] },
//             ],
//           },
//         },
//       },
//     ]);

//     const user = await User.findById(user_id);

//     const restriction = await Restriction.findOne({ user_id: user._id });

//     const minuteUsage = restriction?.voice_trial_minutes_used || 0;
//     const minuteLimit = restriction?.voice_trial_minutes_limit || 0;


//     const phoneNumbers = await PlivoPhoneRecord.find({user_id});
 
    
    

//     res.status(200).json({
//       success: true,
//       data: {...callStats[0],user,voiceMinutes: {
//         used: minuteUsage,
//         remaining: minuteLimit - minuteUsage
//       },
//       phoneNumbers
//     },
//     });
// });

exports.getSuperAdminUserDashboardData = catchAsyncError(async (req, res) => {
  const { startDate, endDate, user_id } = req.query;

  let dateFilter;
  if (startDate && endDate) {
    dateFilter = { $gte: new Date(startDate), $lt: new Date(endDate) };
  } else {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    dateFilter = { $gte: start, $lte: end };
  }

  const callStats = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: dateFilter
      },
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalDuration: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: [{ $type: "$start_time" }, "missing"] },
                  { $ne: [{ $type: "$end_time" }, "missing"] },
                ],
              },
              {
                $divide: [
                  { $subtract: ["$end_time", "$start_time"] },
                  60000, // Convert ms to minutes
                ],
              },
              0,
            ],
          },
        },
        inboundCalls: {
          $sum: {
            $cond: [{ $eq: ["$direction", "inbound"] }, 1, 0],
          },
        },
        outboundCalls: {
          $sum: {
            $cond: [{ $eq: ["$direction", "outbound"] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        averageDuration: {
          $cond: [
            { $eq: ["$totalCalls", 0] },
            0,
            { $divide: ["$totalDuration", "$totalCalls"] },
          ],
        },
      },
    },
  ]);

  const call = callStats[0] || {
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    inboundCalls: 0,
    outboundCalls: 0,
  };

  const user = await User.findById(user_id);
  const restriction = await Restriction.findOne({ user_id: user._id });
  const phoneNumbers = await PlivoPhoneRecord.find({ user_id });

  const minuteUsage = restriction?.voice_trial_minutes_used || 0;
  const minuteLimit = restriction?.voice_trial_minutes_limit || 0;
  const minuteRemaining = minuteLimit - minuteUsage;

  // Phone status chart: calculate active/expired
  let activePhones = 0;
  let expiredPhones = 0;
  phoneNumbers.forEach(p => {
    if (p.status === 'active') activePhones++;
    else expiredPhones++;
  });

  const chartData = {
    callStats: {
      labels: ["Total Calls", "Used Minutes", "Remaining Minutes", "Avg Call Duration"],
      values: [
        call.totalCalls,
        parseFloat(call.totalDuration.toFixed(2)),
        parseFloat(minuteRemaining.toFixed(2)),
        parseFloat(call.averageDuration.toFixed(2))
      ]
    },
    callTypeBreakdown: {
      labels: ["Inbound", "Outbound"],
      values: [call.inboundCalls, call.outboundCalls]
    },
    phoneStatus: {
      labels: ["Active", "Expired"],
      values: [activePhones, expiredPhones]
    }
  };

  res.status(200).json({
    success: true,
    data: {
      ...call,
      user,
      voiceMinutes: {
        used: minuteUsage,
        remaining: minuteRemaining
      },
      phoneNumbers,
      chartData
    }
  });
});



exports.getAllCustomers = catchAsyncError(async (req, res) => {
  const { startDate, endDate,search='', page = 1, limit = 10 } = req.query;

  const query = {};

  if (startDate && endDate) {
    query.created_time = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (search.trim() !== '') {
    const searchRegex = new RegExp(search, 'i'); // case-insensitive

    query.$or = [
      { email: searchRegex },
      { full_name: searchRegex },
      { phone_number: isNaN(search) ? -1 : Number(search) }, // handle numeric input
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [customers, total] = await Promise.all([
    User.find(query)
      .sort({ created_time: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  // Fetch voiceMinutes for each user
  const customersWithStats = await Promise.all(
    customers.map(async (user) => {
      const restriction = await Restriction.findOne({ user_id: user._id });

      const minuteUsage = restriction?.voice_trial_minutes_used || 0;
      const minuteLimit = restriction?.voice_trial_minutes_limit || 0;

      return {
        ...user.toObject(),
        voiceMinutes: {
          used: minuteUsage,
          remaining: minuteLimit - minuteUsage,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    data: customersWithStats,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  });
});


exports.superAdminAssisgNumber = catchAsyncError(async (req, res) => {
  const { user_id,minutes } = req.body;
  const restriction = await Restriction.findOne({ id: user_id });
  
  if (typeof restriction.voice_trial_minutes_limit !== 'number') {
    restriction.voice_trial_minutes_limit = 0;
  }


  restriction.voice_trial_minutes_limit += Number(minutes);
  const user = await User.findById(user_id);

  user.voice_ai_status = "active";
  user.is_active = true;

  await user.save();


  await restriction.save()


  res.status(200).json({
    success: true,
    message: "Minutes Assisg Successfully"
  });
});





exports.fetchSingleCallHistory = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const callHistory = await CallHistory.findById(id);

  if (!callHistory) {
    return res
      .status(404)
      .json({ success: false, message: "Call history not found." });
  }

  res.status(200).json({
    success: true,
    recording: callHistory,
  });
});

exports.deleteCallHistory = async (req, res) => {
  try {
    const { callUuid } = req.params;
    console.log("calluuid", callUuid);
    const caller_id = callUuid;
    const deletedCall = await CallHistory.findOneAndDelete({ caller_id });

    if (!deletedCall) {
      return res.status(404).json({ message: "Call history not found" });
    }

    res.json({ message: "Call history deleted successfully", deletedCall });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getVoiceAIDashboardStats = catchAsyncError(async (req, res) => {
  const user_id = req.user.id;
  const { from, to, period } = req.query;

  // Default time range is last 30 days if not specified
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;

  if (period && period !== "custom") {
    const range = periodToRange(period);
    fromDate = range.from;
    toDate = range.to;
  }

  const stats = await getVoiceAIStats({
    user_id,
    fromDate,
    toDate,
  });

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// Helper function to determine date range based on period
function periodToRange(period) {
  const now = new Date();
  let from = new Date();

  switch (period) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
      break;
    case "week":
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from.setMonth(from.getMonth() - 1);
      break;
    case "year":
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from.setDate(from.getDate() - 30); // Default to 30 days
  }

  return { from, to: now };
}
/**
 *  period = "last_hr" | "today" | "week" | "month" | "custom"
 */

exports.getCallActivityChart = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;
  const { period = "daily" } = req.query;

  const buildData = async (period, user_id, from = null, to = null) => {
    const now = dayjs();
    const isTotal = period === "total";

    // Calculate `to` if not provided
    to = to ? dayjs(to) : calculateToDate(period, now);

    // Calculate `from` if not provided
    from = from ? dayjs(from) : calculateFromDate(period, to);

    // Determine grouping format and date unit
    const { groupFormat, dateUnit } = getGroupingFormat(period);

    // Generate time buckets
    const periods = generateTimeBuckets(period, from, to, now);

    // Build aggregation pipeline
    const pipeline = buildAggregationPipeline(
      user_id,
      isTotal,
      from,
      to,
      groupFormat
    );

    // Execute aggregation
    const raw = await CallHistory.aggregate(pipeline);

    // Process raw data into chart-friendly format
    const chartData = processChartData(raw, periods, isTotal);

    // Calculate stats
    const stats = calculateStats(raw);

    // minute usage and minute remaining
    const restriction = await Restriction.findOne({ user_id: user_id });
    const minuteUsage = restriction.voice_trial_minutes_used || 0;
    const minuteRemaining = restriction.voice_trial_minutes_limit - minuteUsage;
    stats.voiceMinutes = {
      used: minuteUsage,
      remaining: minuteRemaining,
    };

    return {
      chartData,
      stats,
      from,
      to,
    };
  };

  // Helper function to calculate `to` date
  const calculateToDate = (period, now) => {
    switch (period) {
      case "last_hr":
        return now.endOf("minute");
      case "daily":
      case "weekly":
      case "monthly":
        return now.endOf("day");
      default:
        return now;
    }
  };

  // Helper function to calculate `from` date
  const calculateFromDate = (period, to) => {
    switch (period) {
      case "last_hr":
        return to.subtract(1, "hour").startOf("minute");
      case "daily":
        return to.startOf("day");
      case "weekly":
        return to.subtract(6, "day").startOf("day");
      case "monthly":
        return to.startOf("month");
      default:
        return to.subtract(30, "day").startOf("day");
    }
  };

  // Helper function to determine grouping format and date unit
  const getGroupingFormat = (period) => {
    switch (period) {
      case "last_hr":
        return { groupFormat: "%H:%M", dateUnit: "minute" };
      case "daily":
        return { groupFormat: "%H:00", dateUnit: "hour" };
      default:
        return { groupFormat: "%Y-%m-%d", dateUnit: "day" };
    }
  };

  // Helper function to generate time buckets
  const generateTimeBuckets = (period, from, to, now) => {
    if (period === "daily") {
      return Array.from(
        { length: 24 },
        (_, i) => `${String(i).padStart(2, "0")}:00`
      );
    } else if (period === "last_hr") {
      return Array.from(
        { length: 60 },
        (_, i) => `${String(i).padStart(2, "0")}:00`
      );
    } else if (period === "weekly") {
      return Array.from({ length: 7 }, (_, i) =>
        now.subtract(i, "day").format("YYYY-MM-DD")
      ).reverse();
    } else if (period === "monthly") {
      const daysInMonth = now.daysInMonth();
      return Array.from({ length: daysInMonth }, (_, i) =>
        now.date(i + 1).format("YYYY-MM-DD")
      );
    }
    return [];
  };

  // Helper function to build aggregation pipeline
  const buildAggregationPipeline = (
    user_id,
    isTotal,
    from,
    to,
    groupFormat
  ) => [
    {
      $match: {
        user_id,
        ...(!isTotal && {
          created_time: { $gte: new Date(from), $lte: new Date(to) },
        }),
      },
    },
    {
      $addFields: {
        period: {
          $dateToString: {
            format: groupFormat,
            date: "$created_time",
            timezone: "+05:30",
          },
        },
        callCategory: {
          $cond: [{ $eq: ["$calltype", "web"] }, "web", "phone"],
        },
      },
    },
    {
      $group: {
        _id: { period: "$period", type: "$callCategory" },
        totalCalls: { $sum: 1 },
        totalDuration: { $sum: "$call_duration" },
      },
    },
    {
      $group: {
        _id: "$_id.period",
        calls: {
          $push: {
            type: "$_id.type",
            totalCalls: "$totalCalls",
            totalDuration: "$totalDuration",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  // Helper function to process raw data into chart-friendly format
  const processChartData = (raw, periods, isTotal) => {
    if (isTotal) {
      return raw.map((entry) => {
        const row = { web: 0, phone: 0 };
        entry.calls.forEach((call) => {
          row[call.type] = call.totalCalls;
        });
        return {
          name: entry._id,
          web: row.web,
          phone: row.phone,
        };
      });
    }

    const rawMap = new Map();
    raw.forEach((entry) => {
      const row = { web: 0, phone: 0 };
      entry.calls.forEach((call) => {
        row[call.type] = call.totalCalls;
      });
      rawMap.set(entry._id, row);
    });

    return periods.map((p) => ({
      name: p,
      web: rawMap.get(p)?.web || 0,
      phone: rawMap.get(p)?.phone || 0,
    }));
  };

  // Helper function to calculate stats
  const calculateStats = (raw) => {
    let totalWeb = 0,
      totalPhone = 0,
      totalWebDuration = 0,
      totalPhoneDuration = 0;

    raw.forEach((entry) => {
      entry.calls.forEach((call) => {
        if (call.type === "web") {
          totalWeb += call.totalCalls;
          totalWebDuration += call.totalDuration;
        } else {
          totalPhone += call.totalCalls;
          totalPhoneDuration += call.totalDuration;
        }
      });
    });

    return {
      totalCalls: totalWeb + totalPhone,
      totalDuration: totalWebDuration + totalPhoneDuration,
      web: {
        totalCalls: totalWeb,
        totalDuration: totalWebDuration,
      },
      phone: {
        totalCalls: totalPhone,
        totalDuration: totalPhoneDuration,
      },
    };
  };

  res.status(200).json({
    success: true,
    data: await buildData(period, user_id, req.query.from, req.query.to),
  });
});

exports.getRecentCallsData = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;
  const { limit = 5, page = 1, from, to } = req.query;

  // Default time range is last 30 days if not specified
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;

  const recentCallsData = await getRecentCalls({
    user_id,
    limit,
    page,
    fromDate,
    toDate,
  });

  res.status(200).json({
    success: true,
    data: recentCallsData,
  });
});

exports.getChatbotDashboardStats = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;
  const { from, to, period } = req.query;

  // Default time range is last 30 days if not specified
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;

  if (period && period !== "custom") {
    const range = periodToRange(period);
    fromDate = range.from;
    toDate = range.to;
  }

  const stats = await getChatbotDashboardStats({
    user_id,
    fromDate,
    toDate,
  });

  res.status(200).json({
    success: true,
    data: stats,
  });
});

exports.getMessageActivityChart = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;
  const { period = "monthly" } = req.query;

  // Determine date range based on period
  const now = new Date();
  let fromDate, toDate;

  switch (period) {
    case "daily":
      // Last 24 hours
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "weekly":
      // Last 7 days
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "monthly":
      // Last 30 days
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 29);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;
    case "yearly":
      // Last 12 months
      fromDate = new Date(now);
      fromDate.setMonth(fromDate.getMonth() - 11);
      fromDate.setDate(1);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
      break;
    default:
      // Default to monthly
      fromDate = new Date(now);
      fromDate.setDate(fromDate.getDate() - 29);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(now);
      toDate.setHours(23, 59, 59, 999);
  }

  const chartData = await getMessageActivityChartData({
    user_id,
    fromDate,
    toDate,
    period,
  });

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

exports.getPeakMessageTimesData = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;

  // Default to last 30 days
  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - 30);
  fromDate.setHours(0, 0, 0, 0);

  const peakTimesData = await getPeakMessageTimes({
    user_id,
    fromDate,
    toDate: now,
  });

  res.status(200).json({
    success: true,
    data: peakTimesData,
  });
});

exports.getUniqueVisitorsData = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;

  const visitorsData = await getUniqueVisitors({
    user_id,
  });

  res.status(200).json({
    success: true,
    data: visitorsData,
  });
});

exports.getRecentMessagesData = catchAsyncError(async (req, res) => {
  const user_id = req.query.user_id || req.user.id;
  const { limit = 5, page = 1, from, to } = req.query;

  // Default time range is last 30 days if not specified
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;

  const recentMessagesData = await getRecentMessages({
    user_id,
    limit,
    page,
    fromDate,
    toDate,
  });

  res.status(200).json({
    success: true,
    data: recentMessagesData,
  });
});

exports.getCallsBySource = catchAsyncError(async (req, res) => {
  const user_id = req.user.id;
  const { from, to, interval } = req.query;

  // Default time range is last 30 days if not specified
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;

  if (!interval) {
    // Default to daily if not specified
    interval = "daily";
  }

  const chartData = await getCallsBySourceOverTime({
    user_id,
    fromDate,
    toDate,
    interval,
  });

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

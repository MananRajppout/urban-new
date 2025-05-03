require("dotenv").config();
const { twiml } = require("twilio");
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  AiAgent,
  TwilioPhoneRecord,
  CallHistory,
  TelnyxPhoneRecord,
  VoiceAiInvoice,
} = require("./model");
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
  checkVoiceAICredits,
  checkBuyNumberAPI,
  getDefaultCreditCard,
} = require("./impl");
const { getCurrentTime } = require("../utils/infra");
const BookingHandler = require("./booking_handler");
const { User } = require("../user/model");
const {
  getPricingForCall,
  getTelnyxPricingForCall,
  calculateTelnyxCallCosts,
  voiceAICreditSync,
} = require("../pricing/voice_ai_cost_cal");
const ElevenLabsVoiceHelper = require("./elevenlabs");
const DeepGramVoiceHelper = require("./deepgram");
const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const phoneUtil = PhoneNumberUtil.getInstance();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const twilioClient = new twilio(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_SECRET_KEY
);

const telnyx = require("telnyx")(process.env.TELNYX_API_KEY);

// Function to find the AI agent
async function findAiAgent(callSid, callFrom, callTo) {
  let aiAgent = null;
  const currentTime = getCurrentTime();
  try {
    aiAgent = await AiAgent.findById(callFrom);
    if (!aiAgent) throw new Error("AI agent not found for callFrom");

    // Log call history and session data (commented out for now).
    createCallHistory(
      {
        caller_id: callSid,
        start_time: currentTime,
        calltype: "web-call",
        twilio_phone_number: callFrom,
        from_phone_number: callFrom,
      },
      aiAgent
    );
  } catch (e) {
    try {
      aiAgent = await AiAgent.findOne({ twilio_phone_number: callTo });
      if (!aiAgent) throw new Error("AI agent not found for callTo");

      // Log call history and session data (commented out for now).
      createCallHistory(
        {
          caller_id: callSid,
          start_time: currentTime,
          calltype: "inbound-call",
          twilio_phone_number: callTo,
          from_phone_number: callFrom,
        },
        aiAgent
      );
    } catch (e2) {
      try {
        aiAgent = await AiAgent.findOne({ twilio_phone_number: callFrom });
        if (!aiAgent)
          throw new Error("AI agent not found for outbound callFrom");

        // Log call history and session data (commented out for now).
        createCallHistory(
          {
            caller_id: callSid,
            start_time: currentTime,
            calltype: "outbound-call",
            twilio_phone_number: callFrom,
            from_phone_number: callTo,
          },
          aiAgent
        );
      } catch (e3) {
        console.error("Error finding AI agent:", e3);
        aiAgent = await AiAgent.findById("66b93a1e47760fc1cb7cc394");

        // Log call history and session data (commented out for now).
        createCallHistory(
          {
            caller_id: callSid,
            start_time: currentTime,
            calltype: "default-call",
            twilio_phone_number: "66b93a1e47760fc1cb7cc394",
            from_phone_number: "66b93a1e47760fc1cb7cc394",
          },
          aiAgent
        );
      }
    }
  }

  return aiAgent;
}

exports.handleTelnyxCallRequest = catchAsyncError(async (req, res, next) => {
  try {
    // Telnyx with streaming

    if (req.body.data.event_type == "call.initiated") {
      const aiAgent = await findAiAgent(
        req.body.data.payload.call_control_id,
        req.body.data.payload.from.split("@")[0],
        req.body.data.payload.to.split("@")[0]
      );
      const checkVoiceAI = await checkVoiceAICredits(aiAgent.user_id);
      // console.log(req.body.data);
      if (
        req.body.data.payload.connection_id ==
          process.env.TELNYX_SIP_CONNECIION_ID ||
        req.body.data.payload.direction == "incoming"
      ) {
        const call = new telnyx.Call({
          call_control_id: req.body.data.payload.call_control_id,
        });

        let response = "";

        if (checkVoiceAI.success) {
          response = await call.answer({
            stream_track: "both_tracks",
            stream_url: `wss://${process.env.WEBSOCKET_SERVER}/ws/telnyx-connection`,
            preferred_codecs: "PCMU",
          });
        } else {
          response = await call.hangup();
        }

        res.setHeader("Content-Type", "application/xml");
        return res.send(response.toString());
      }
    } else if (req.body.data.event_type == "call.answered") {
      console.log("Call has answered.");
      console.log(req.body.data);
    } else if (req.body.data.event_type == "call.recording.saved") {
      console.log("Recording has been saved.");
      const callSid = req.body.data.payload.call_control_id;

      const histObj = await CallHistory.findOne({ caller_id: callSid });
      console.log("Recording ID: ", histObj.recording_sid);

      // Config for recording retrieval
      let recordingConfig = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.telnyx.com/v2/recordings/${histObj.recording_sid}`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
        },
      };
      // Await both the recording and transcription API calls
      const recordingResponse = await axios.request(recordingConfig);

      // Assign the recording URL from the recording API response
      histObj.recording_url = recordingResponse.data.data.download_urls.mp3;
      histObj.end_time = req.body.data.payload.end_time;
      histObj.cost = await getTelnyxPricingForCall(histObj);
      await histObj.save();
    } else if (req.body.data.event_type == "call.hangup") {
      console.log("Call has ended.");
      const callSid = req.body.data.payload.call_control_id;
      const histObj = await CallHistory.findOne({ caller_id: callSid });
      histObj.cost = await getTelnyxPricingForCall(histObj);
      const user = await User.findById(histObj.user_id);
      // Check if the end_time and created_time are the same
      if (
        new Date(histObj.end_time).getTime() ===
        new Date(histObj.created_time).getTime()
      ) {
        // Calculate the duration of the call in minutes
        const callDuration =
          (new Date(req.body.data.payload.end_time).getTime() -
            new Date(req.body.data.payload.start_time).getTime()) /
          60000;

        // Update voice AI credits based on the available credits and call duration
        if (user.voice_ai_credits > 0) {
          // Deduct based on call duration if the user has credits
          user.voice_ai_credits -= callDuration * 0.15;
          console.log("Call Duration: ", callDuration);
        } else {
          // Deduct based on the cost if the user has no credits left
          user.voice_ai_credits -= histObj.cost;
        }

        // Save the updated user object
        await user.save();
      }
      histObj.start_time = req.body.data.payload.start_time;
      histObj.end_time = req.body.data.payload.end_time;
      await histObj.save();
    } else if (req.body.data.event_type == "call.bridged") {
      console.log("\n\n\nCall Bridged !");
    }
  } catch (err) {
    console.log(
      "telynx webhook failing with payload : ",
      req.body.data,
      "\nerror:",
      err
    );
  }

  res.setHeader("Content-Type", "application/xml");
  return res.send("success");
  // const voiceResponse = new twiml.VoiceResponse();
  // const cookies = req.cookies;

  // // Determine the type of call and retrieve the relevant phone number.
  // const callType = req.query.calltype || "ph-inbound";

  // let aiAgent;
  // if(callType === "web-inbound"){
  // 	// Fetch the AI agent model associated with the agent ID.
  // 	const aiAgentId = req.body.To;
  // 	aiAgent = await AiAgent.findById(aiAgentId);
  // } else{
  // 	// Fetch the AI agent model associated with the phone number.
  // 	const queryPhoneNumber =  callType === "ph-outbound" ? req.body.From: req.body.Called;
  // 	aiAgent = await AiAgent.findOne({ twilio_phone_number: queryPhoneNumber });
  // }

  // // Check if session cookies exist; if not, set up a new session.
  // if (!cookies || !cookies.messages) {
  // 	const callerId = req.body.CallSid;
  // 	console.log("generating audio file")

  // 	// Generate the URL for the welcome message audio file.
  // 	const publicAudioFileUrl = await getVoiceRespUrl(
  // 		aiAgent?.welcome_msg,
  // 		aiAgent
  // 	);

  // 	// Construct the system prompt based on the AI agent's configuration.
  // 	const systemPrompt = generateSystemPrompt(aiAgent);

  // 	// Set cookies to maintain session state across requests.
  // 	res.cookie(
  // 		"messages",
  // 		JSON.stringify([
  // 			{ role: "system", content: systemPrompt },
  // 			{ role: "assistant", content: aiAgent?.welcome_msg },
  // 		])
  // 	);

  // 	res.cookie(
  // 		"chatbot_configuration",
  // 		JSON.stringify({
  // 			user_id: aiAgent?.user_id,
  // 			chatgpt_model: aiAgent?.chatgpt_model,
  // 			voice_id: aiAgent?.voice_id,
  // 			transfer_call_number: aiAgent?.transfer_call_number,
  // 			cal_api_key: aiAgent?.cal_api_key,
  // 			cal_event_type_id: aiAgent?.cal_event_type_id,
  // 			cal_timezone: aiAgent?.cal_timezone,
  // 			voice_engine_name: aiAgent?.voice_engine_name,
  // 			ambient_sound: aiAgent?.ambient_sound,
  // 			voice_speed: aiAgent?.voice_speed,
  // 			temperature: aiAgent?.voice_temperature,
  // 			ambient_sound_volume: aiAgent?.ambient_sound_volume,
  // 			responsiveness: aiAgent?.responsiveness,
  // 			reminder_interval: aiAgent?.reminder_interval,
  // 			reminder_count: aiAgent?.reminder_count,
  // 			ambient_sound_volume:aiAgent?.ambient_sound_volume,
  // 			language_code: aiAgent?.language,
  // 			end_call_duration: aiAgent?.end_call_duration,
  // 			fallback_voice_ids: aiAgent?.fallback_voice_ids,
  // 			CalenderTool: {
  // 				cal_api_key: aiAgent?.calendar_tools[0]?.cal_api_key,
  // 				cal_event_type_id: aiAgent?.calendar_tools[0]?.cal_event_type_id,
  // 				cal_timezone: aiAgent?.calendar_tools[0]?.cal_timezone
  // 			}
  // 		})
  // 	);

  // 	res.cookie("reminder_curr_count", 0);
  // 	res.cookie("caller_id", callerId);
  // 	res.cookie("current_time", Date.now());

  // 	// Pause before playing the welcome message, adjusted by the AI agent's responsiveness.
  // 	voiceResponse.pause({
  // 		length: 5.0 * (1.0 - aiAgent?.responsiveness),
  // 	});

  // 	//play the generated audio file
  // 	await voiceResponse.play(publicAudioFileUrl);

  // 	// Log call history and session data (commented out for now).
  // 	// const currentTime = getCurrentTime();
  // 	// createCallHistory({ caller_id: callerId, start_time: currentTime, calltype: callType, from_phone_number: req.body.From }, aiAgent);
  // 	// createCallSessionLogs({ caller_id: callerId, created_time: currentTime, ai_reply_text: aiAgent?.welcome_msg, ai_reply_voice_url: publicAudioFileUrl, user_id: aiAgent?.user_id });

  // 	// voiceResponse.record({
  // 	// 		playBeep:false,
  // 	// 		recordingStatusCallback: '/api/twilio-recording-events', // Replace with your endpoint to handle recording
  // 	// 		recordingStatusCallbackMethod: 'POST',
  // 	// 		recordingStatusCallbackEvent : ['completed']
  // 	// 	});
  // }

  // // Configure the voice response to gather speech input.
  // voiceResponse.gather({
  // 	input: ["speech"],
  // 	speechModel: "experimental_conversations",
  // 	speechTimeout: "auto",
  // 	enhanced: false,
  // 	bargeIn: true,
  // 	action: "/api/respond",
  // });

  // // Send the generated TwiML response back to Twilio.
  // res.setHeader("Content-Type", "application/xml");
  // res.send(voiceResponse.toString());
  // await createTwilioCallRecording(twilioClient, req.body.CallSid, req.get('host'))
});

// Helper function to format phone number
function formatPhoneNumberPretty(phoneNumber, country) {
  const number = phoneUtil.parseAndKeepRawInput(phoneNumber, country);
  return phoneUtil.format(number, PhoneNumberFormat.NATIONAL);
}

// Create a new AI agent
exports.createAIAgent = catchAsyncError(async (req, res, next) => {
  const user_id = req.user.id;

  // Construct the payload directly from req.body and add user_id
  const aiAgentPayload = { ...req.body, user_id, name: "UrbanChat Assistant" };

  // Create the new AI agent
  const newAIAgent = await AiAgent.create(aiAgentPayload);
  res.status(201).json({
    success: true,
    message: "AI agent created successfully",
    ai_agent: newAIAgent,
  });
});

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

  const aiAgent = await AiAgent.findOne({ _id: agentId });

  if (!aiAgent) {
    return res.status(404).json({
      success: false,
      message: "No AI Agent found",
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

  const updatedAgent = await AiAgent.findOneAndUpdate(
    { _id: agent_id },
    { $set: req.body },
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
exports.deleteAIAgent = catchAsyncError(async (req, res, next) => {
  const { agent_id } = req.params;

  // Find and delete the AI agent by its unique identifier
  const aiAgent = await AiAgent.findByIdAndDelete(agent_id);
  if (!aiAgent) {
    return res
      .status(404)
      .json({ message: "AI agent not found", success: false });
  }

  res.status(200).json({
    success: true,
    message: "AI agent deleted successfully",
  });
});

exports.fetchPhoneNumbers = catchAsyncError(async (req, res, next) => {
  const phone_numbers = await TelnyxPhoneRecord.find({ user_id: req.user.id });
  res.status(200).json({
    success: true,
    phone_numbers,
  });
});

// WARNING: PLEASE NOT TEST THIS API WITH LIVE CREDENTIAL OTHERWISE PAYMENT WILL CHARGED FROM TELNYX ACCOUNT!
exports.buyPhoneNumber = catchAsyncError(async (req, res, next) => {
  try {
    const { country = "US", twilio_number } = req.body;
    const user_id = req.user.id;

    const checkBuyNumber = await checkBuyNumberAPI(user_id);

    if (!checkBuyNumber.success) res.status(400).json(checkBuyNumber);

    const defaultCard = await getDefaultCreditCard(user_id);

    // console.log(defaultCard);

    if (!defaultCard.card) res.status(400).json(defaultCard);

    let purchasedNumber;

    if (twilio_number) {
      // validate if number already exists in database
      const numberAlreadyPurchased = await TelnyxPhoneRecord.findOne({
        user_id: user_id,
        twilio_phone_number: twilio_number,
      });

      if (numberAlreadyPurchased) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already purchased",
        });
      }

      // listing phone numbers
      const searchPhoneNumber = await telnyx.phoneNumbers.list({
        filter: { phone_number: twilio_number },
      });

      if (!searchPhoneNumber.data[0].id) {
        return res.status(400).json({
          success: false,
          message: "Phone number not found",
        });
      }

      const phoneNumberUpdated = await telnyx.phoneNumbers.update(
        searchPhoneNumber.data[0].id,
        { connection_id: "2504299250511250823" }
      );

      const phoneNumberPretty = formatPhoneNumberPretty(twilio_number, country);

      // // Use provided phone number if available
      purchasedNumber = await TelnyxPhoneRecord.create({
        twilio_sid: phoneNumberUpdated.data.id,
        user_id: user_id,
        twilio_phone_number: twilio_number,
        phone_number_pretty: phoneNumberPretty,
        country: country,
      });
    } else {
      // Find available phone numbers
      let availablePhoneNumbers;

      const numberList = await telnyx.availablePhoneNumbers.list({
        filter: {
          country_code: country,
          limit: 1,
        },
      });

      availablePhoneNumbers = numberList.data[0].phone_number;

      if (!availablePhoneNumbers) {
        return res.status(404).json({
          success: false,
          message:
            "No available phone numbers found, try using different country",
        });
      }

      const costInformation = numberList.data[0].cost_information;

      const totalAmount =
        Number(costInformation.monthly_cost) +
        Number(costInformation.upfront_cost);

      const currency = costInformation.currency.toLowerCase();

      // console.log(totalAmount,' ', currency, ' ', defaultCard.card.customer_id + ' ' + defaultCard.card.payment_method_id);

      await stripe.paymentMethods.attach(defaultCard.card.payment_method_id, {
        customer: defaultCard.card.customer_id,
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // amount in dollars
        currency: currency, // currency
        customer: defaultCard.card.customer_id,
        payment_method: defaultCard.card.payment_method_id, // the stored payment method ID
        off_session: true,
        confirm: true, // Automatically confirms and attempts the payment
      });

      // console.log(paymentIntent);

      await VoiceAiInvoice.create({
        user_id: user_id,
        amount: totalAmount,
        currency: currency,
        payment_intent_id: paymentIntent.id,
        payment_method: "Phone Number Purchase",
      });

      // Purchase the first available phone number
      const broughtPhoneNumber = await telnyx.numberOrders.create({
        phone_numbers: [{ phone_number: availablePhoneNumbers }],
      });

      // listing phone numbers
      const searchPhoneNumber = await telnyx.phoneNumbers.list({
        filter: { phone_number: availablePhoneNumbers },
      });

      if (!searchPhoneNumber.data[0].id) {
        return res.status(400).json({
          success: false,
          message: "Phone number not found",
        });
      }

      const phoneNumberUpdated = await telnyx.phoneNumbers.update(
        searchPhoneNumber.data[0].id,
        { connection_id: "2504299250511250823" }
      );

      const phoneNumberPretty = formatPhoneNumberPretty(
        availablePhoneNumbers,
        country
      );

      purchasedNumber = await TelnyxPhoneRecord.create({
        user_id: user_id,
        twilio_phone_number: availablePhoneNumbers,
        phone_number_pretty: phoneNumberPretty,
        country: country,
        twilio_sid: phoneNumberUpdated.data.id,
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
      message: error.message,
    });
  }
});

exports.deleteTelnyxPhoneNumber = catchAsyncError(async (req, res, next) => {
  const { tw_ph_id } = req.params; // twilio phone record id
  const tx_ph = await TelnyxPhoneRecord.findOne({
    _id: tw_ph_id,
    user_id: req.user.id,
  });

  if (!tx_ph) {
    return res.status(404).json({
      message: "Telnyx phone record object not found",
      success: false,
    });
  }

  // const { data: phoneNumber } = await telnyx.phoneNumbers.del(tx_ph_id);
  await TelnyxPhoneRecord.deleteOne({ _id: tx_ph.id }); // two step verification for deleting a number

  await telnyx.phoneNumbers.del(tx_ph.twilio_sid);

  return res
    .status(200)
    .json({ message: "Phone number has been deleted", success: true });
});

exports.fetchSinglePhoneNumber = catchAsyncError(async (req, res, next) => {
  const phoneRecord = await TelnyxPhoneRecord.findOne({
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
  const currentPhoneRecord = await TelnyxPhoneRecord.findById(phone_number_id);
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
    TelnyxPhoneRecord.findByIdAndUpdate(
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
  const { to_phone_number, ai_agent_id, connection_id } = req.query;

  const aiAgent = await AiAgent.findById(ai_agent_id);

  if (!aiAgent) {
    return res
      .status(404)
      .json({ message: "AI agent not found", success: false });
  }

  const { data: call } = await telnyx.calls.create({
    connection_id: "2504299250511250823",
    to: "+" + to_phone_number.trim(),
    from: aiAgent.twilio_phone_number,
    stream_track: "both_tracks",
    stream_url: `wss://${process.env.WEBSOCKET_SERVER}/ws/telnyx-connection`,
    preferred_codecs: "PCMU",
  });

  return res.status(200).json({ message: "Call get initiated", success: true });
});

exports.generateWebCallAccessToken = async (req, res) => {
  try {
    // Extract the agent_id from the request query
    //   const agent_id = req.query.agent_id;
    //   const identity = agent_id;
    const connection_id = process.env.TELNYX_SIP_CONNECIION_ID;

    // Retrieve the telephony credential using the Telnyx API
    const credentialResponse = await telnyx.telephonyCredentials.create({
      connection_id,
    });
    // Generate the access token from the telephony credential
    const accessToken =
      await telnyx.telephonyCredentials.generateAccessTokenFromCredential(
        credentialResponse.data.id
      );

    // Return the token and identity as JSON response
    res.json({
      token: accessToken.data,
      identity: credentialResponse.data.sip_username,
    });
  } catch (error) {
    // Handle any errors and send a response
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate access token" });
  }
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

  const elevenLabsVoices = await elevenlabs.fetchVoices();
  const deepgramVoices = await deepgram.fetchVoices();
  // const deepGramVoices = await deepgram.fetchVoices();
  return res
    .status(200)
    .send({ elevenlabs: elevenLabsVoices, deepgram: deepgramVoices }); // add later deepgram: deepGramVoices
});

exports.fetchCallHistory = catchAsyncError(async (req, res) => {
  const userId = req.user._id;

  const page = req.query.page || 1;
  const per_page = req.query.per_page || 10;

  const callHistory = await CallHistory.find({ user_id: userId })
    .sort({ created_time: -1 })
    .skip((page - 1) * per_page)
    .limit(parseInt(per_page));

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
exports.fetchSingleCallHistory = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  // Find call history by ID
  const callHistory = await CallHistory.findById(id);
  if (!callHistory) {
    return res
      .status(404)
      .json({ success: false, message: "Call history not found." });
  }

  // Config for recording retrieval
  const recordingConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://api.telnyx.com/v2/recordings/${callHistory.recording_sid}`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
    },
  };

  try {
    // Fetch recording data from Telnyx API
    const recordingResponse = await axios.request(recordingConfig);

    // Update call history with recording URL
    callHistory.recording_url = recordingResponse.data.data.download_urls.mp3;
    await callHistory.save();

    // Send response with updated call history
    res.status(200).json({
      success: true,
      recording: callHistory,
    });
  } catch (err) {
    console.error("Error retrieving recording:", err.message);

    // Send response with updated call history
    res.status(200).json({
      success: true,
      recording: callHistory,
    });
  }
});

// Set the base config with your API token
const baseConfig = {
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.TELNYX_API_KEY}`, // Replace <TOKEN> with your actual API token
  },
};

// Delay function to pause execution for a given amount of time
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to get all unique country codes and names where numbers are available
async function getCountryCodes() {
  try {
    const response = await axios.get(
      "https://api.telnyx.com/v2/country_coverage",
      baseConfig
    );
    const countriesData = response.data.data;

    // Extract country names and codes where inventory_coverage is true
    const countryList = Object.entries(countriesData)
      .map(([countryName, countryInfo]) => {
        if (countryInfo.numbers) {
          return { name: countryName, code: countryInfo.code }; // Include only if inventory_coverage is true
        }
        return null; // Skip if inventory_coverage is false
      })
      .filter(Boolean); // Remove null entries

    return countryList;
  } catch (error) {
    console.error("Error fetching country codes:", error);
    throw new Error("Failed to fetch country codes");
  }
}

// Function to get phone numbers with cost information for each country code
async function getPhoneNumbersWithCost(country, retries = 10) {
  try {
    const response = await axios.get(
      "https://api.telnyx.com/v2/available_phone_numbers",
      {
        ...baseConfig,
        params: {
          "filter[country_code]": country.code,
          "filter[limit]": 1, // Limit results to 1
        },
      }
    );

    // Check and extract cost information from the first result
    if (response.data.data && response.data.data.length > 0) {
      const number = response.data.data[0];
      const costInfo = number.cost_information;
      return {
        country: country.name,
        country_code: country.code,
        cost_information: {
          upfront_cost: costInfo.upfront_cost,
          monthly_cost: costInfo.monthly_cost,
          currency: costInfo.currency,
        },
      };
    } else {
      return {
        country: country.name,
        country_code: country.code,
        cost_information: null,
      }; // No phone numbers found for this country code
    }
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      // Retry after a delay if rate-limited
      const retryDelay = Math.pow(2, 3 - retries) * 1000; // Exponential backoff
      // console.warn(`Rate limit exceeded for ${country.code}. Retrying in ${retryDelay / 1000} seconds...`);
      await delay(retryDelay);
      return getPhoneNumbersWithCost(country, retries - 1); // Retry
    } else {
      console.error(`Error fetching phone numbers for ${country.code}:`, error);
      return {
        country: country.name,
        country_code: country.code,
        cost_information: null,
      };
    }
  }
}

// Main function to combine both steps
exports.fetchCountryAndPhoneNumbersCosts = catchAsyncError(async (req, res) => {
  try {
    const countryCodes = await getCountryCodes();

    // Check if any country codes were found
    if (!countryCodes || countryCodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No country codes available",
      });
    }

    // Fetch phone numbers and costs concurrently
    const results = await Promise.all(
      countryCodes.map((country) => getPhoneNumbersWithCost(country))
    );

    // Filter out null results
    const filteredResults = results.filter(
      (result) => result.cost_information !== null
    );
    res.status(200).json({
      success: true,
      data: filteredResults,
    });
  } catch (error) {
    console.error("Error in fetching phone numbers and costs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch phone numbers and costs",
      error: error.message,
    });
  }
});

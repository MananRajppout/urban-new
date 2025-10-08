const catchAsyncError = require("../../middleware/catchAsyncError");
const { User } = require("../../user/model");
const {
  getDefaultCreditCard,
  checkBuyNumberAPI,
} = require("../../voice_ai/impl");
const {
  AiAgent,
  VoiceAiInvoice,
  CallHistory,
  SheetConfig,
} = require("../../voice_ai/model");
const plivoClient = require("../configs/plivoClient");
const stripeClient = require("../configs/stripeClient");
const { PlivoPhoneRecord } = require("../model/plivoModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  getNumberRateInCent,
  justPhoneNumber,
  numberRateInCurrency,
  createSIPTrunks,
  createSIPDispatchRule,
  createOutboundTrunk,
  createSIPParticipant,
} = require("../utils");
// exports.getAllNumbers = catchAsyncError(async (req, res) => {
//   const numbers = await PlivoPhoneRecord.find({
//     user_id: req.user.id,
//   });
//   res.status(200).json({
//     success: true,
//     numbers,
//   });
// });
const googleSheetsService = require("../../services/googlesheets.service");
const { triggerCallSummaryIfEnabled } = require("../../user/job");

exports.getAllNumbers = catchAsyncError(async (req, res) => {
  try {
    // Fetch all phone numbers for the user
    const numbers = await PlivoPhoneRecord.find({
      user_id: req.user.id,
    }).lean();
    if (!numbers.length) {
      return res.status(200).json({
        success: true,
        numbers: [],
        message: "No phone numbers found for the user.",
      });
    }

    // Extract phone numbers
    const phoneNumbers = numbers.map((n) => n.phone_number);

    // Fetch associated AI agents
    const agents = await AiAgent.find({
      plivo_phone_number: { $in: phoneNumbers },
    }).lean();

    // Create a map for quick lookup of agents by phone number
    const agentMap = new Map(
      agents.map((agent) => [agent.plivo_phone_number, agent])
    );

    // Fetch call durations for each phone number
    const callDurations = await CallHistory.aggregate([
      {
        $match: {
          $or: [
            { from_phone_number: { $in: phoneNumbers } },
            { plivo_phone_number: { $in: phoneNumbers } },
          ],
        },
      },
      {
        $project: {
          phone_number: {
            $cond: [
              { $in: ["$from_phone_number", phoneNumbers] },
              "$from_phone_number",
              "$plivo_phone_number",
            ],
          },
          duration: "$call_duration",
        },
      },
      {
        $group: {
          _id: "$phone_number",
          total_duration: { $sum: "$duration" },
        },
      },
    ]);

    // Create a map for quick lookup of total call durations by phone number
    const durationMap = new Map(
      callDurations.map((d) => [d._id, d.total_duration])
    );

    // Combine data into a single response
    const updatedNumbers = numbers.map((number) => ({
      ...number,
      agent_id: agentMap.get(number.phone_number)?._id || null,
      agent_name: agentMap.get(number.phone_number)?.name || null,
      total_call_duration: durationMap.get(number.phone_number) || 0,
    }));

    // Send the response
    res.status(200).json({
      success: true,
      numbers: updatedNumbers,
    });
  } catch (error) {
    console.error("Error in getAllNumbers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch phone numbers.",
      error: error.message,
    });
  }
});

exports.getNumber = catchAsyncError(async (req, res) => {
  let phone_number = await PlivoPhoneRecord.findById(req.params.id);
  if (!phone_number) {
    return res.status(400).json({
      success: false,
      message: "Phone number not found",
    });
  }
  phone_number = phone_number.toObject();

  // just for old compatibility
  const agent = await AiAgent.findOne({
    plivo_phone_number: phone_number.phone_number,
  });
  if (agent) {
    phone_number.agent_id = agent._id;
    phone_number.agent_name = agent.name;
  }

  res.status(200).json({
    success: true,
    phone_number,
  });
});

exports.buyNumber = catchAsyncError(async (req, res) => {
  const { countryISO } = req.body;
  const user_id = req.user.id;
  if (!countryISO) {
    return res.status(400).json({
      success: false,
      message: "countryISO is required in body",
    });
  }
  // check card exist or not
  const checkBuyNumber = await checkBuyNumberAPI(user_id);

  if (!checkBuyNumber.success) res.status(400).json(checkBuyNumber);

  const defaultCard = await getDefaultCreditCard(user_id);

  // console.log(defaultCard);

  if (!defaultCard.card) res.status(400).json(defaultCard);

  // console.log("defaultCard", countryISO,phone_number);
  // find phone number exist or not in plivo

  let searchedNumber = await plivoClient.numbers.search(countryISO);
  if (!searchedNumber.length) {
    return res.status(400).json({
      success: false,
      message: "Phone number not found",
    });
  }
  searchedNumber = searchedNumber[0];

  let totalAmount = getNumberRateInCent(countryISO); //in cents

  console.log("totalAmount", totalAmount);
  console.log("payment process started");

  await stripeClient.paymentMethods.attach(defaultCard.card.payment_method_id, {
    customer: defaultCard.card.customer_id,
  });
  const currency = "USD";
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: totalAmount, // amount in cents
    currency: currency, // currency
    customer: defaultCard.card.customer_id,
    payment_method: defaultCard.card.payment_method_id, // the stored payment method ID
    off_session: true,
    confirm: true, // Automatically confirms and attempts the payment
  });
  console.log("payment done", paymentIntent);

  if (paymentIntent.status !== "succeeded") {
    return res.status(400).json({
      success: false,
      message: "Payment failed",
    });
  }

  await VoiceAiInvoice.create({
    user_id: user_id,
    amount: totalAmount,
    currency: currency,
    payment_intent_id: paymentIntent.id,
    payment_method: "Phone Number Purchase",
  });

  // buy plivo number
  // create a plivo
  const appId = process.env.PLIVO_VOICE_APP_ID;
  const purchasedNumber = await plivoClient.numbers.buy(
    searchedNumber.number,
    appId
  );

  console.log("purchasedNumber", purchasedNumber);
  if (purchasedNumber.status !== "fulfilled") {
    return res.status(400).json({
      success: false,
      message: "Phone number not purchased Some error occured",
    });
  }
  const numberDetails = await plivoClient.numbers.get(searchedNumber.number);
  const agent = await AiAgent.findOne({
    user_id: user_id,
  });

  console.log("creating sip trunk...");
  const sipTrunkId = await createSIPTrunks(searchedNumber.number);
  console.log("sip trunk created", sipTrunkId);
  console.log("creating dispatch rule...");
  const dispatchRuleId = await createSIPDispatchRule(sipTrunkId, searchedNumber.number, agent?._id || undefined);
  console.log("dispatch rule created", dispatchRuleId);
  console.log("creating sip outbound trunk...");
  const sipOutboundTrunkId = await createOutboundTrunk(searchedNumber.number);
  console.log("sip outbound trunk created", sipOutboundTrunkId);

  // create a phone record
  const phoneRecord = new PlivoPhoneRecord({
    user_id,
    app_id: appId,
    phone_number: searchedNumber.number,
    country: countryISO,
    number_type: numberDetails.type || "local",
    number_location: numberDetails.region || "",
    status: numberDetails.active ? "active" : "inactive",
    monthly_rental_fee: countryISO == "IN" ? "499" : "2",
    currency: countryISO == "IN" ? "INR" : "USD",
    renewal_date: numberDetails.renewalDate || "",
    sip_outbound_trunk_id: sipOutboundTrunkId,
    sip_trunk_dispatch_rule_id: dispatchRuleId,
    sip_trunk_id: sipTrunkId,
  });

  await phoneRecord.save();

  res.status(200).json({
    success: true,
    message: "Phone number Added successfully",
    numberStatus: "fulfilled",
  });
});

exports.updateNumber = catchAsyncError(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "This route will update number",
  });
});

exports.deleteNumber = catchAsyncError(async (req, res) => {
  const applications = await plivoClient.applications.list({});

  res.status(200).json({
    success: true,
    applications,
  });
});

exports.deleteNumberPlivo = catchAsyncError(async (req, res) => {
  try {
    const number = req.query.number;
    if (!number) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const plivoRecord = await PlivoPhoneRecord.findOne({
      phone_number: number,
    });
    const { plan_id, user_id } = plivoRecord;
    if (!plivoRecord) {
      console.log(" Plivo record not found for this number");
      return { success: false, message: "Plivo record not found" };
    }

    const user = await User.findById(user_id);
    if (!user) {
      console.log(" User not found");
      return { success: false, message: "User not found" };
    }

    //  Find subscription in user's subscriptions array
    const subscriptionData = user.subscriptions.find(
      (sub) => sub.planId === plan_id
    );

    if (!subscriptionData || !subscriptionData.subscriptionId) {
      console.log(" Subscription ID not found in user's subscriptions");
      return { success: false, message: "Subscription ID not found" };
    }

    const stripeSubId = subscriptionData.subscriptionId;

    //cancel subcroitption here
    const result = await stripe.subscriptions.cancel(stripeSubId);
    // Step 5: Pull subscription from user's subscriptions array
    await User.updateOne(
      { _id: user_id },
      { $pull: { subscriptions: { planId: plan_id } } }
    );
    // Unrent the number from Plivo
    const deleteNumber = await plivoClient.numbers.unrent(number);
    // Remove from database
    const deleteFromDB = await PlivoPhoneRecord.deleteOne({
      phone_number: number,
    });
    //  Delete Stripe Subscription

    res.status(200).json({
      success: true,
      message: "Number deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete number",
      error: error.message,
    });
  }
});

exports.searchNumbers = catchAsyncError(async (req, res) => {
  const { countryISO } = req.query;
  const numbers = await plivoClient.numbers.search(countryISO, {
    limit: 5,
    type: countryISO == "IN" ? "local" : "tollfree",
    services: "voice",
  });
  const monthlyRate = numberRateInCurrency(countryISO);
  numbers.forEach((number) => {
    number.monthlyRate = monthlyRate;
  });
  res.status(200).json({
    success: true,
    numbers,
  });
});

exports.updateAgentPhoneNumber = catchAsyncError(async (req, res) => {
  const { phone_number_id, agent_id } = req.body;
  const phoneRecord = await PlivoPhoneRecord.findById(phone_number_id);
  if (!phoneRecord) {
    return res.status(400).json({
      success: false,
      message: "Phone number not found",
    });
  }

  const phone_number = phoneRecord.phone_number;
  console.log("creating dispatch rule...");
  const dispatchRuleId = await createSIPDispatchRule(phoneRecord.sip_trunk_id, phone_number, agent_id, phoneRecord.sip_trunk_dispatch_rule_id);
  console.log("dispatch rule created", dispatchRuleId);
  phoneRecord.sip_trunk_dispatch_rule_id = dispatchRuleId;
  await phoneRecord.save();

  // check phone_number is not associated with any other agent
  // if yes, remove the association
  const agents = await AiAgent.find({ plivo_phone_number: phone_number });
  if (agents.length) {
    await Promise.all(
      agents.map(async (agent) => {
        agent.plivo_phone_number = "";
        await agent.save();
      })
    );
  }
  // associate phone_number with agent_id
  const agent = await AiAgent.findById(agent_id);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }
  agent.plivo_phone_number = phone_number;
  await agent.save();
  return res.status(200).json({
    success: true,
    message: "Phone number updated successfully",
  });
});

exports.voiceWebhook = catchAsyncError(async (req, res) => {
  console.log("voice webhook", req.body);
  
  const body = req.body;
  const is_outbound = body.Direction == "outbound";

  let params = {
    contentType: "audio/x-mulaw;rate=8000",
    // to: req.body.To,
    // from: req.body.From,
    callId: req.body.CallUUID,
    callType: "plivo",
    dir: req.body.Direction == "outbound" ? "out" : "in",
    ...req.query,
  };

  // check agent exist or not
  const phone = req.body.Direction == "outbound" ? req.body.From : req.body.To;
  const agent = await AiAgent.findOne({
    plivo_phone_number: phone,
  });
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }

  // if plan is inactive then return error
  // even better we can play audio with message "Your plan is inactive"
  const user = await User.findById(agent.user_id);
  if (user.voice_ai_status == "inactive") {
    return res.type("text/xml").send(`
      <Response>
        <Speak>Sorry, your voice AI is inactive. Please upgrade plan</Speak>
      </Response>
      `);
  }

  // create or update CallHistory
  await CallHistory.findOneAndUpdate(
    { caller_id: req.body.CallUUID },
    {
      $setOnInsert: {
        user_id: agent.user_id,
        calltype: "phone",
        direction: req.body.Direction,
        plivo_phone_number: req.body.To,
        from_phone_number: req.body.From,
        agent_id: agent._id,
        voice_name: agent.voice_name,
        voice_engine_id: "-",
        chatgpt_model: agent.chatgpt_model,
        voice_id: agent.voice_id,
      },
    },
    { upsert: true }
  );
  const serverUrl = process.env.SERVER_URL;
  const statusCallbackUrl = `${serverUrl}/api/phone/webhook/status`;
  const recordCallbackUrl = `${serverUrl}/api/phone/webhook/record`;


  // const streamUrl = `${process.env.VOICE_SOCKET_SERVER}/media-stream?callId=${params.callId}&amp;callType=${params.callType}&amp;dir=${params.dir}`;
  const queryString = new URLSearchParams(params).toString().replace(/&/g, '&amp;');
  const streamUrl = `${process.env.VOICE_SOCKET_SERVER}/media-stream?${queryString}`;
    
  
  const PlivoXMLResponse = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
      <Record action="${recordCallbackUrl}" redirect="false" recordSession="true" maxLength="3600" />
      <Stream statusCallbackUrl="${statusCallbackUrl}"  streamTimeout="86400" keepCallAlive="true" bidirectional="true" contentType="${params.contentType}" audioTrack="inbound">
       ${streamUrl}
      </Stream>
  </Response>`;

  res.type("text/xml").send(PlivoXMLResponse);
});

exports.statusWebhook = catchAsyncError(async (req, res) => {
  console.log("status webhook", req.body);
  res.status(200).json({
    success: true,
  });
});
exports.recordWebhook = catchAsyncError(async (req, res) => {
  console.log("record webhook", req.body);
  // update recording url
  const callHistory = await CallHistory.findOne({
    caller_id: req.body.CallUUID,
  });
  if (callHistory) {
    callHistory.recording_url = req.body.RecordUrl;
    callHistory.recording_sid = req.body.RecordingID;
    await callHistory.save();
  }
  res.status(200).json({
    success: true,
  });
});

exports.hangupWebhook = catchAsyncError(async (req, res) => {
  const {
    CallUUID,
    CallStatus,
    Duration,
    CallDuration,
    CallerName,
    Caller,
    Called,
    CallType,
    Direction,
    From,
    To,
    HangupCause,
    RecordingUrl,
    RecordingDuration,
    RecordingSid,
    CallTime,
    Event,
    Timestamp,
    level,
  } = req.body;
  console.log("hangup webhook", req.body);

  // Find the call history record
  const callHistory = await CallHistory.findOne({ caller_id: CallUUID });
  console.log("callHistory", callHistory);
  if (!callHistory) {
    return res
      .status(404)
      .json({ success: false, message: "Call history not found" });
  }

  callHistory.start_time = new Date(req.body.StartTime);
  callHistory.end_time = new Date(req.body.EndTime);
  callHistory.cost = parseFloat(req.body.TotalCost);
  callHistory.call_duration = Math.floor(
    (callHistory.end_time - callHistory.start_time) / 60000
  );

  // Determine call status based on Plivo's CallStatus
  let callStatus = "Not Answered";
  if (CallStatus === "completed") {
    callStatus = "Successful";
  } else if (CallStatus === "busy" || CallStatus === "failed") {
    callStatus = "Failed";
  }

  // Update call history
  callHistory.call_status = callStatus;
  callHistory.end_time = new Date();
  callHistory.recording_url = RecordingUrl || "";
  callHistory.recording_sid = RecordingSid || "";
  callHistory.disconnection_reason = HangupCause || "";
  callHistory.level = level || "No Level";
  callHistory.summary = callHistory.chat_history
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  await callHistory.save();

  // Trigger individual call summary if enabled
  try {
    await triggerCallSummaryIfEnabled(callHistory._id);
  } catch (error) {
    console.error("Error triggering call summary:", error);
    // Don't fail the request if summary email fails
  }

  // Find the active sheet configuration for this agent
  const config = await SheetConfig.findOne({
    agent_id: callHistory.agent_id,
    is_active: true,
  });
  console.log("config", config);
  if (config) {
    try {
      // Update the row in the sheet with call status and summary separately
      const status = `Call ${callStatus}\nDuration: ${
        Duration || CallDuration || 0
      }s`;
      const summary = callHistory.summary;

      // Use the stored row number from call history
      const rowToUpdate = callHistory.sheet_row;
      console.log("Using stored row number:", rowToUpdate);

      if (rowToUpdate) {
        console.log("Updating row:", rowToUpdate);
        await googleSheetsService.updateRowStatus(
          config.spreadsheet_id,
          config.sheet_name,
          rowToUpdate,
          status,
          summary
        );

        // Update call counts in config
        if (callStatus === "Successful") {
          config.successful_calls++;
        } else if (callStatus === "Failed" || callStatus === "Not Answered") {
          config.failed_calls++;
        }
        await config.save();
      } else {
        console.error("No row number stored in call history");
      }
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      // Don't fail the request if sheet update fails
    }
  }

  res.status(200).json({ success: true });
});

exports.makeCall = catchAsyncError(async (req, res) => {
  const { from, to } = req.body;
  // const serverUrl = process.env.SERVER_URL;
  // const answer_url = `${serverUrl}/api/phone/webhook/voice`;
  // const response = await plivoClient.calls.create(from, to, answer_url);

  const phoneRecord = await PlivoPhoneRecord.findOne({
    phone_number: from,
  });

  if (!phoneRecord) {
    return res.status(400).json({
      success: false,
      message: "Phone number not found",
    });
  }

  const agent = await AiAgent.findOne({
    plivo_phone_number: from,
  });

  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }
  const sipCallId = await createSIPParticipant(to, from, phoneRecord.sip_outbound_trunk_id, agent._id);
  const callHistory = new CallHistory({ caller_id: sipCallId });
  if (!callHistory) {
    console.log("callHistory not created in makeCall");
  } else {
    console.log("Call History created in make Call", sipCallId);
  }
  res.status(200).json({
    success: true,
    sipCallId,
  });
  // Store the row number in call history
});

exports.processNextCall = catchAsyncError(async (req, res) => {
  const { agentId } = req.body;
  const agent = await AiAgent.findById(agentId);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }

  // Find the active sheet configuration for this agent
  const config = await SheetConfig.findOne({
    agent_id: agentId,
    is_active: true,
  });

  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found for this agent",
    });
  }

  // Get the next row to process
  const row = await getNextRow(config);
  if (!row) {
    return res.status(400).json({
      success: false,
      message: "No more rows to process",
    });
  }

  // Make the call
  const response = await makeCall(agent, row.phone);
  if (!response.success) {
    return res.status(400).json({
      success: false,
      message: response.message,
    });
  }

  // Update the current row in the configuration
  config.current_row = row.row_number;
  await config.save();

  res.status(200).json({
    success: true,
    message: "Call initiated successfully",
    data: {
      call_id: response.request_uuid,
      row_number: row.row_number,
    },
  });
});

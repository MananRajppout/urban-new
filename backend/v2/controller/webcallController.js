const catchAsyncError = require("../../middleware/catchAsyncError");
const { getRestriction } = require("../../user/impl");
const { Restriction, User } = require("../../user/model");
const { AiAgent, CallHistory, SheetConfig } = require("../../voice_ai/model");
const { getMinutesDiff } = require("../utils");
const googleSheetsService = require("../../services/googlesheets.service");
const { triggerCallSummaryIfEnabled } = require("../../user/job");

// for now no need to use this
exports.pickupWebhook = catchAsyncError(async (req, res) => {
  const { agentId, callId, callType, start_time } = req.body;
  console.log("pickupWebhook", callType);
  const agent = await AiAgent.findById(agentId);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }
  //   if plan is inactive then return error
  const user = await User.findById(agent.user_id);
  if (user.voice_ai_status === "inactive") {
    return res.status(400).json({
      success: false,
      message: "Voice AI is inactive",
    });
  }

  // Find the active sheet configuration for this agent
  const config = await SheetConfig.findOne({
    agent_id: agentId,
    is_active: true,
  });

  const callHistory = new CallHistory({
    user_id: agent.user_id,
    caller_id: callId,
    calltype: "web",
    agent_id: agent._id,
    voice_name: agent.voice_name,
    voice_engine_id: "-",
    chatgpt_model: agent.chatgpt_model,
    voice_id: agent.voice_id,
    start_time: new Date(),
    sheet_row: config ? config.current_row : null,
    call_state: "active",
  });
  await callHistory.save();
  console.log("pickupWebhook@callHistory registered");
  res.status(200).json({
    success: true,
  });
});

exports.hangupWebhook = catchAsyncError(async (req, res) => {
  console.log("hangupWebhook");
  let {
    agentId,
    callId,
    callType,
    end_time,
    chat_history,
    summary,
    call_status,
    user_sentiment,
    disconnection_reason,
    direction,
    from,
    to
  } = req.body;
  
  end_time = new Date(end_time);
  // console.log(
  //   chat_history,
  //   summary,
  //   call_status,
  //   user_sentiment,
  //   disconnection_reason
  // );
  const agent = await AiAgent.findById(agentId);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }
  //   if plan is inactive then return error
  const user = await User.findById(agent.user_id);
  if (user.voice_ai_status === "inactive") {
    return res.status(400).json({
      success: false,
      message: "Voice AI is inactive",
    });
  }
  let callHistory = await CallHistory.findOne({ caller_id: callId });
  if (!callHistory) {
    return res.status(400).json({
      success: false,
      message: "Call history not found",
    });
  }

  triggerCallSummaryIfEnabled(callHistory._id);

  callHistory.end_time = end_time;
  callHistory.chat_history = chat_history;
  callHistory.summary = summary;
  callHistory.call_status = call_status;
  callHistory.user_sentiment = user_sentiment;
  callHistory.disconnection_reason = disconnection_reason;
  callHistory.direction = direction;
  callHistory.calltype = callType;
  if (from) callHistory.from_phone_number = from
  if (to) callHistory.plivo_phone_number = to

  const durationInMinutes = getMinutesDiff(
    callHistory.start_time,
    callHistory.end_time
  );
  callHistory.call_duration = durationInMinutes;
  callHistory.call_state = "completed";
  await callHistory.save();

  // Trigger individual call summary if enabled
  try {
    await triggerCallSummaryIfEnabled(callHistory._id);
  } catch (error) {
    console.error("Error triggering call summary:", error);
    // Don't fail the request if summary email fails
  }

  console.log("voice call time in min ", durationInMinutes);
  const restriction = await getRestriction(agent.user_id);
  if (restriction && user) {
    // if (user.voice_ai_status === "free_trial") {
    restriction.voice_trial_minutes_used += durationInMinutes;
    if (
      restriction.voice_trial_minutes_used >
      restriction.voice_trial_minutes_limit
    ) {
      user.voice_ai_status = "inactive";
      await user.save();
    }
    await restriction.save();
    // }
  }

  //cut tenant minutes too
  // const tenantProvider = await User.findOne({ slug_name: user.tenant });
  // if (user.tenant !== "main" && tenantProvider._id.toString() !== user._id.toString()) {
  //   const restriction = await getRestriction(tenantProvider._id);
  //   restriction.voice_trial_minutes_used += durationInMinutes;

  //   if (
  //     restriction.voice_trial_minutes_used >
  //     restriction.voice_trial_minutes_limit
  //   ) {
  //     tenantProvider.voice_ai_status = "inactive";
  //     await tenantProvider.save();
  //   }
  //   await restriction.save();
  // }


  // Find the active sheet configuration for this agent
  const config = await SheetConfig.findOne({
    agent_id: agentId,
    is_active: true,
  });

  console.log("callHistory.sheet_call", callHistory.sheet_call);
  if (config && callHistory.sheet_call) {
    try {
      // Update the row in the sheet with call status and summary separately
      const status = `Call ${call_status}`;
      const callSummary = summary || "No summary available";

      // First try to use the stored row number from call history
      let rowToUpdate = callHistory.sheet_row;
      const phone_number = callHistory.plivo_phone_number;
      // If no row number is stored, try to find the row by phone number
      if (!rowToUpdate && phone_number) {
        console.log("Looking for phone number:", phone_number);

        // Make sure we have column mappings
        if (!config.column_mappings) {
          console.error("No column mappings found in sheet configuration");
        } else {
          console.log("Using column mappings:", config.column_mappings);

          // Find the row by phone number using the column mappings
          rowToUpdate = await googleSheetsService.findRowByPhoneNumber(
            config.spreadsheet_id,
            config.sheet_name,
            phone_number,
            config.column_mappings
          );

          // If row is found, update the call history with the row number
          if (rowToUpdate) {
            callHistory.sheet_row = rowToUpdate;
            await callHistory.save();
          }
        }
      }

      console.log("Using row number:", rowToUpdate);

      if (rowToUpdate) {
        console.log("Updating row:", rowToUpdate);
        await googleSheetsService.updateRowStatus(
          config.spreadsheet_id,
          config.sheet_name,
          rowToUpdate,
          status,
          callSummary
        );

        // Update call counts in config
        if (call_status === "Successful") {
          config.successful_calls++;
        } else if (call_status === "Failed" || call_status === "Not Answered") {
          config.failed_calls++;
        }
        await config.save();
      } else {
        console.error("Could not find row for call");
      }
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      // Don't fail the request if sheet update fails
    }
  }

  res.status(200).json({
    success: true,
  });
});

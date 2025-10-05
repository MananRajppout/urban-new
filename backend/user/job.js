const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { User } = require("./model");
const { CallHistory } = require("../voice_ai/model");
const { sendMailFun } = require("../utils/infra");
const cron = require('node-cron');
const {config} = require("dotenv")
config();

/**
 * Send daily call summary to users who have enabled daily_summary
 * This cron should run daily at 12:00 PM
 */
const sendDailySummaries = catchAsyncFunc(async () => {
  console.log("Running sendDailySummaries cron job...");
  
  try {
    // Get all users who have daily_summary enabled and have a summary_email
    const users = await User.find({
      daily_summary: true,
      summary_email: { $ne: "", $exists: true },
      is_active: true
    });

    console.log(`Found ${users.length} users with daily summary enabled`);

    if (users.length === 0) {
      console.log("No users found with daily summary enabled");
      return;
    }

    // Get yesterday's date range (from 12:00 PM yesterday to 12:00 PM today)
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0); // Today 12:00 PM
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Yesterday 12:00 PM

    console.log(`Fetching calls from ${startDate} to ${endDate}`);

    // Process users in batches to avoid overwhelming the system
    const batchSize = 10;
    const totalBatches = Math.ceil(users.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min((i + 1) * batchSize, users.length);
      const userBatch = users.slice(start, end);

      // Process batch in parallel
      await Promise.all(userBatch.map(async (user) => {
        try {
          await processDailySummaryForUser(user, startDate, endDate);
        } catch (error) {
          console.error(`Error processing daily summary for user ${user._id}:`, error);
        }
      }));

      console.log(`Processed batch ${i + 1}/${totalBatches}`);
    }

    console.log("Daily summaries sent successfully");
  } catch (error) {
    console.error("Error in sendDailySummaries:", error);
  }
});

/**
 * Process daily summary for a single user
 */
const processDailySummaryForUser = async (user, startDate, endDate) => {
  try {
    // Get call history for the user in the specified date range
    const callHistory = await CallHistory.find({
      user_id: user._id.toString(),
      start_time: { $gte: startDate, $lte: endDate }
    }).sort({ start_time: -1 });

    // Calculate summary statistics
    const totalCalls = callHistory.length;
    const successfulCalls = callHistory.filter(call => call.call_status === 'Successful').length;
    const totalDuration = callHistory.reduce((sum, call) => {
      if (call.start_time && call.end_time) {
        return sum + Math.floor((call.end_time - call.start_time) / 60000); // Convert to minutes
      }
      return sum + (call.call_duration || 0);
    }, 0);

    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

    // Sentiment analysis
    const sentimentCounts = {
      Positive: callHistory.filter(call => call.user_sentiment === 'Positive').length,
      Neutral: callHistory.filter(call => call.user_sentiment === 'Neutral').length,
      Negative: callHistory.filter(call => call.user_sentiment === 'Negative').length
    };

    // Get unique callers
    const uniqueCallers = new Set(callHistory.map(call => call.from_phone_number).filter(Boolean)).size;

    // Prepare call details for email
    const callDetails = callHistory.slice(0, 10).map(call => ({
      time: call.start_time ? call.start_time.toLocaleString() : 'N/A',
      caller: call.from_phone_number || 'Unknown',
      duration: call.call_duration || Math.floor((call.end_time - call.start_time) / 60000) || 0,
      status: call.call_status || 'Unknown',
      sentiment: call.user_sentiment || 'Neutral',
      summary: call.summary ? call.summary.substring(0, 150) + '...' : 'No summary available'
    }));

    const tenantProvider = await User.findOne({slug_name: user.tenant});
    console.log(tenantProvider);
    const domain = tenantProvider.custom_domain || `${tenantProvider.slug_name}.${process.env.MAIN_DOMAIN}`
    console.log(domain);
    // Prepare email context
    const emailContext = {
      user_name: user.full_name || 'User',
      date_range: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      total_calls: totalCalls,
      successful_calls: successfulCalls,
      total_duration: totalDuration,
      avg_duration: avgDuration,
      unique_callers: uniqueCallers,
      sentiment_positive: sentimentCounts.Positive,
      sentiment_neutral: sentimentCounts.Neutral,
      sentiment_negative: sentimentCounts.Negative,
      call_details: callDetails,
      has_calls: totalCalls > 0,
      domain: domain
    };

    // Send email
    const emailSent = sendMailFun("daily_call_summary", emailContext, user.summary_email);
    
    if (emailSent) {
      console.log(`Daily summary sent to ${user.summary_email} for user ${user._id}`);
    } else {
      console.error(`Failed to send daily summary to ${user.summary_email} for user ${user._id}`);
    }

  } catch (error) {
    console.error(`Error processing daily summary for user ${user._id}:`, error);
    throw error;
  }
};

/**
 * Send individual call summary
 * This should be called after each call is completed
 */
const sendIndividualCallSummary = catchAsyncFunc(async (callHistoryId) => {
  console.log(`Sending individual call summary for call ${callHistoryId}`);
  
  try {
    // Get the call history
    const callHistory = await CallHistory.findById(callHistoryId);
    if (!callHistory) {
      console.error(`Call history not found for ID: ${callHistoryId}`);
      return;
    }

    // Get the user
    const user = await User.findById(callHistory.user_id);
    if (!user) {
      console.error(`User not found for ID: ${callHistory.user_id}`);
      return;
    }

    // Check if user has call_summary enabled and has summary_email
    if (!user.call_summary || !user.summary_email) {
      console.log(`User ${user._id} doesn't have call summary enabled or no email provided`);
      return;
    }

    // Calculate call duration
    const duration = callHistory.call_duration || 
      (callHistory.start_time && callHistory.end_time ? 
        Math.floor((callHistory.end_time - callHistory.start_time) / 60000) : 0);

    // Prepare chat history for email
    const chatMessages = callHistory.chat_history ? 
      callHistory.chat_history.slice(0, 10).map(msg => ({
        role: msg.role === 'user' ? 'Caller' : 'Agent',
        content: msg.content,
        timestamp: msg.timestamp ? msg.timestamp.toLocaleTimeString() : ''
      })) : [];

    // Prepare email context
    const emailContext = {
      user_name: user.full_name || 'User',
      call_time: callHistory.start_time ? callHistory.start_time.toLocaleString() : 'N/A',
      caller_number: callHistory.from_phone_number || 'Unknown',
      call_duration: duration,
      call_status: callHistory.call_status || 'Unknown',
      user_sentiment: callHistory.user_sentiment || 'Neutral',
      call_summary: callHistory.summary || 'No summary available',
      chat_messages: chatMessages,
      has_chat_history: chatMessages.length > 0,
      disconnection_reason: callHistory.disconnection_reason || 'Normal',
      recording_url: callHistory.recording_url || null
    };

    // Send email
    const emailSent = sendMailFun("individual_call_summary", emailContext, user.summary_email);
    
    if (emailSent) {
      console.log(`Individual call summary sent to ${user.summary_email} for call ${callHistoryId}`);
    } else {
      console.error(`Failed to send individual call summary to ${user.summary_email} for call ${callHistoryId}`);
    }

  } catch (error) {
    console.error(`Error sending individual call summary for call ${callHistoryId}:`, error);
  }
});

/**
 * Helper function to trigger individual call summary
 * This can be called from the call completion webhook
 */
const triggerCallSummaryIfEnabled = async (callHistoryId) => {
  try {
    console.log(`Triggering individual call summary for call ${callHistoryId}`);
    await sendIndividualCallSummary(callHistoryId);
  } catch (error) {
    console.error(`Error triggering call summary for call ${callHistoryId}:`, error);
  }
};

// Run daily summary cron job
cron.schedule('0 12 * * *', sendDailySummaries);

module.exports = {
  sendDailySummaries,
  sendIndividualCallSummary,
  triggerCallSummaryIfEnabled
};

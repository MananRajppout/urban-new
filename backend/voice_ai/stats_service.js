const { CallHistory } = require("./model");
const { User } = require("../user/model");
const { getRestriction } = require("../user/impl");
const { AiAgent } = require("./model");

exports.getVoiceAIStats = async (args) => {
  const { user_id, fromDate, toDate } = args;

  // Get total calls and call durations
  const callStats = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        ...(fromDate &&
          toDate && {
            start_time: { $gte: fromDate, $lte: toDate },
          }),
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
                  60000, // Convert milliseconds to minutes
                ],
              },
              0,
            ],
          },
        },
        uniqueCallers: { $addToSet: "$from_phone_number" },
        uniqueAgents: { $addToSet: "$agent_id" },
      },
    },
  ]);
  // console.log(callStats, "callStats");
  // Get previous period stats for comparison
  const previousPeriodStart = new Date(fromDate);
  previousPeriodStart.setDate(
    previousPeriodStart.getDate() - (toDate - fromDate) / (24 * 60 * 60 * 1000)
  );

  const previousCallStats = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: previousPeriodStart, $lt: fromDate },
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
                  60000, // Convert milliseconds to minutes
                ],
              },
              0,
            ],
          },
        },
        uniqueCallers: { $addToSet: "$from_phone_number" },
        uniqueAgents: { $addToSet: "$agent_id" },
      },
    },
  ]);

  // Get calls by agent
  const callsByAgent = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        ...(fromDate &&
          toDate && {
            start_time: { $gte: fromDate, $lte: toDate },
          }),
      },
    },
    {
      $group: {
        _id: "$agent_id",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get calls from same number (repeat callers)
  const callsFromSameNumber = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        from_phone_number: { $ne: "" },
        ...(fromDate &&
          toDate && {
            start_time: { $gte: fromDate, $lte: toDate },
          }),
      },
    },
    {
      $group: {
        _id: "$from_phone_number",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalRepeatCalls: { $sum: 1 },
      },
    },
  ]);

  // Get previous period repeat calls
  const previousCallsFromSameNumber = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        from_phone_number: { $ne: "" },
        start_time: { $gte: previousPeriodStart, $lt: fromDate },
      },
    },
    {
      $group: {
        _id: "$from_phone_number",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
    {
      $group: {
        _id: null,
        totalRepeatCalls: { $sum: 1 },
      },
    },
  ]);

  // Get user restrictions to determine minutes remaining
  const user = await User.findById(user_id);

  const restriction = await getRestriction(user_id);

  // Get total active AI agents
  const activeAgents = await AiAgent.countDocuments({
    user_id: user_id,
    is_active: true,
  });
  console.log(activeAgents, "activeAgents");

  const previousActiveAgents = await AiAgent.countDocuments({
    user_id: user_id,
    is_active: true,
    created_time: { $lt: fromDate },
  });
  console.log(previousActiveAgents, "previousActiveAgents");
  // Calculate statistics
  const stats = callStats[0] || {
    totalCalls: 0,
    totalDuration: 0,
    uniqueCallers: [],
    uniqueAgents: [],
  };
  const prevStats = previousCallStats[0] || {
    totalCalls: 0,
    totalDuration: 0,
    uniqueCallers: [],
    uniqueAgents: [],
  };

  // Helper function to calculate percentage change
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const totalCalls = stats.totalCalls;
  const totalCallsChange = calculatePercentChange(
    totalCalls,
    prevStats.totalCalls
  );

  const avgCallDuration =
    totalCalls > 0
      ? Math.round((stats.totalDuration / totalCalls) * 100) / 100
      : 0;
  const prevAvgCallDuration =
    prevStats.totalCalls > 0
      ? Math.round((prevStats.totalDuration / prevStats.totalCalls) * 100) / 100
      : 0;
  const avgCallDurationChange = calculatePercentChange(
    avgCallDuration,
    prevAvgCallDuration
  );

  const minutesUsed = Math.round(stats.totalDuration);
  const prevMinutesUsed = Math.round(prevStats.totalDuration);
  const minutesUsedChange = calculatePercentChange(
    minutesUsed,
    prevMinutesUsed
  );

  // Determine minutes remaining based on user plan
  let minutesRemaining = 0;
  let minutesRemainingChange = 0;

  if (user && restriction) {
    if (user.voice_ai_status === "free_trial") {
      minutesRemaining = Math.max(
        0,
        restriction.voice_trial_minutes_limit -
          restriction.voice_trial_minutes_used
      );
      const prevMinutesRemaining = Math.max(
        0,
        restriction.voice_trial_minutes_limit -
          (restriction.voice_trial_minutes_used - minutesUsed)
      );
      minutesRemainingChange = calculatePercentChange(
        minutesRemaining,
        prevMinutesRemaining
      );
    } else if (user.voice_ai_credits > 0) {
      // Assuming 1 credit = 1 minute for simplicity
      minutesRemaining = Math.round(user.voice_ai_credits);
      minutesRemainingChange = 0; // Can't easily calculate change for credits
    }
  }

  // Calculate unique callers
  const uniqueCallers = stats.uniqueCallers ? stats.uniqueCallers.length : 0;
  const prevUniqueCallers = prevStats.uniqueCallers
    ? prevStats.uniqueCallers.length
    : 0;
  const uniqueCallersChange = calculatePercentChange(
    uniqueCallers,
    prevUniqueCallers
  );

  // Calculate calls from same number
  const callsFromSameNumberValue =
    callsFromSameNumber[0]?.totalRepeatCalls || 0;
  const prevCallsFromSameNumberValue =
    previousCallsFromSameNumber[0]?.totalRepeatCalls || 0;
  const callsFromSameNumberChange = calculatePercentChange(
    callsFromSameNumberValue,
    prevCallsFromSameNumberValue
  );

  // Calculate calls by AI agent
  const callsByAIAgent = callsByAgent.reduce(
    (sum, agent) => sum + agent.count,
    0
  );
  const callsByAIAgentChange = calculatePercentChange(
    callsByAIAgent,
    prevStats.totalCalls
  );

  // Calculate active AI agents
  const activeAIAgentsChange = calculatePercentChange(
    activeAgents,
    previousActiveAgents
  );

  return {
    // Original stats
    totalCalls: {
      value: totalCalls,
      change: totalCallsChange,
    },
    avgCallDuration: {
      value: avgCallDuration,
      change: avgCallDurationChange,
      formattedValue: formatDuration(avgCallDuration),
    },
    minutesUsed: {
      value: minutesUsed,
      change: minutesUsedChange,
    },
    minutesRemaining: {
      value: minutesRemaining,
      change: minutesRemainingChange,
    },

    // New stats
    callsOverTime: {
      value: totalCalls,
      change: totalCallsChange,
    },
    callsByAIAgent: {
      value: callsByAIAgent,
      change: callsByAIAgentChange,
    },
    callsFromSameNumber: {
      value: callsFromSameNumberValue,
      change: callsFromSameNumberChange,
    },
    uniqueCallers: {
      value: uniqueCallers,
      change: uniqueCallersChange,
    },
    activeAIAgents: {
      value: activeAgents,
      change: activeAIAgentsChange,
    },
  };
};

// Helper function to format duration as MM:SS
function formatDuration(minutes) {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

exports.getCallActivityChartData = async (args) => {
  const { user_id, fromDate, toDate, period } = args;

  // Determine the grouping format based on period
  let groupFormat;
  let sortFormat;

  switch (period) {
    case "daily":
      // Group by hour for daily view
      groupFormat = { $dateToString: { format: "%H:00", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%H", date: "$start_time" } };
      break;
    case "weekly":
      // Group by day for weekly view
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
      };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
      break;
    case "monthly":
      // Group by day for monthly view
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
      };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
      break;
    default:
      // Default to daily view
      groupFormat = { $dateToString: { format: "%H:00", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%H", date: "$start_time" } };
  }

  // Get call counts grouped by time period
  const callActivity = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        sortKey: { $first: sortFormat },
      },
    },
    {
      $sort: { sortKey: 1 },
    },
    {
      $project: {
        _id: 0,
        time: "$_id",
        count: 1,
      },
    },
  ]);

  // Fill in missing time periods with zero counts
  const filledData = fillMissingTimePeriods(
    callActivity,
    fromDate,
    toDate,
    period
  );

  return {
    series: [
      {
        name: "Calls",
        data: filledData.map((item) => ({
          x: item.time,
          y: item.count,
        })),
      },
    ],
  };
};

// Helper function to fill in missing time periods with zero counts
function fillMissingTimePeriods(data, fromDate, toDate, period) {
  const result = [];
  const dataMap = new Map(data.map((item) => [item.time, item.count]));

  if (period === "daily") {
    // Fill in hours for daily view (00:00 to 23:00)
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      result.push({
        time: timeStr,
        count: dataMap.get(timeStr) || 0,
      });
    }
  } else if (period === "weekly") {
    // Fill in days for weekly view
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      result.push({
        time: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (period === "monthly") {
    // Fill in days for monthly view
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      result.push({
        time: dateStr,
        count: dataMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return result;
}

exports.getRecentCalls = async (args) => {
  const { user_id, limit = 5, page = 1, fromDate, toDate } = args;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build match criteria
  const matchCriteria = {
    user_id: user_id,
    ...(fromDate &&
      toDate && {
        start_time: { $gte: fromDate, $lte: toDate },
      }),
  };

  // Get total count for pagination
  const totalCount = await CallHistory.countDocuments(matchCriteria);

  // Fetch recent calls with agent details
  const recentCalls = await CallHistory.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $lookup: {
        from: "aiagents",
        localField: "agent_id",
        foreignField: "_id",
        as: "agent",
      },
    },
    {
      $unwind: {
        path: "$agent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: { start_time: -1 }, // Sort by most recent first
    },
    {
      $skip: skip,
    },
    {
      $limit: parseInt(limit),
    },
    {
      $project: {
        _id: 1,
        time: "$start_time",
        caller_id: "$from_phone_number",
        agent: {
          id: "$agent._id",
          name: "$agent.name",
        },
        duration: {
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
                60000, // Convert milliseconds to minutes
              ],
            },
            0,
          ],
        },
        sentiment: "$user_sentiment",
        status: "$call_status",
      },
    },
  ]);

  // Format the data for the table
  const formattedCalls = recentCalls.map((call) => {
    // Format time to display as "Today, HH:MM" or "Yesterday, HH:MM" or "MM/DD/YYYY"
    const callTime = new Date(call.time);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let timeDisplay;
    if (callTime.toDateString() === today.toDateString()) {
      timeDisplay = `Today, ${callTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${callTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else if (callTime.toDateString() === yesterday.toDateString()) {
      timeDisplay = `Yesterday, ${callTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${callTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else {
      timeDisplay = callTime.toLocaleDateString();
    }

    // Format duration as MM:SS
    const durationMinutes = Math.floor(call.duration);
    const durationSeconds = Math.round((call.duration - durationMinutes) * 60);
    const formattedDuration = `${durationMinutes}:${durationSeconds
      .toString()
      .padStart(2, "0")}`;

    return {
      id: call._id,
      time: timeDisplay,
      caller_id: call.caller_id || "Unknown",
      agent: call.agent.name || "Unknown Agent",
      duration: formattedDuration,
      sentiment: call.sentiment || "Neutral",
      status: call.status || "Unknown",
    };
  });

  return {
    calls: formattedCalls,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(totalCount / limit),
    },
  };
};

exports.getChatbotDashboardStats = async (args) => {
  const { user_id, fromDate, toDate } = args;

  // Get total chats and related metrics
  const chatStats = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        ...(fromDate &&
          toDate && {
            start_time: { $gte: fromDate, $lte: toDate },
          }),
      },
    },
    {
      $group: {
        _id: null,
        totalChats: { $sum: 1 },
        // You might need to adjust this based on how leads are tracked in your system
        totalLeads: {
          $sum: {
            $cond: [{ $eq: ["$lead_generated", true] }, 1, 0],
          },
        },
        // Assuming tokens are tracked in the call history
        tokensUsed: { $sum: { $ifNull: ["$tokens_used", 0] } },
      },
    },
  ]);

  // Get previous period stats for comparison
  const previousPeriodStart = new Date(fromDate);
  previousPeriodStart.setDate(
    previousPeriodStart.getDate() - (toDate - fromDate) / (24 * 60 * 60 * 1000)
  );

  const previousChatStats = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: previousPeriodStart, $lt: fromDate },
      },
    },
    {
      $group: {
        _id: null,
        totalChats: { $sum: 1 },
        totalLeads: {
          $sum: {
            $cond: [{ $eq: ["$lead_generated", true] }, 1, 0],
          },
        },
        tokensUsed: { $sum: { $ifNull: ["$tokens_used", 0] } },
      },
    },
  ]);

  // Get user's token allocation
  const user = await User.findById(user_id);
  const restriction = await getRestriction(user_id);

  // Calculate remaining tokens based on user's plan
  // This is an example - adjust according to your actual token tracking system
  const totalTokenAllocation = restriction?.token_limit || 5000000; // Default if not set

  // Calculate statistics
  const stats = chatStats[0] || {
    totalChats: 0,
    totalLeads: 0,
    tokensUsed: 0,
  };

  const prevStats = previousChatStats[0] || {
    totalChats: 0,
    totalLeads: 0,
    tokensUsed: 0,
  };

  // Helper function to calculate percentage change
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate changes compared to previous period
  const totalChatsChange = calculatePercentChange(
    stats.totalChats,
    prevStats.totalChats
  );

  const totalLeadsChange = calculatePercentChange(
    stats.totalLeads,
    prevStats.totalLeads
  );

  const tokensUsedChange = calculatePercentChange(
    stats.tokensUsed,
    prevStats.tokensUsed
  );

  // Calculate remaining tokens
  const remainingTokens = Math.max(0, totalTokenAllocation - stats.tokensUsed);

  // Remaining tokens change is inverse of tokens used change
  const remainingTokensChange =
    tokensUsedChange > 0 ? -tokensUsedChange : Math.abs(tokensUsedChange);

  return {
    totalChats: {
      value: stats.totalChats,
      change: totalChatsChange,
    },
    totalLeads: {
      value: stats.totalLeads,
      change: totalLeadsChange,
    },
    tokensUsed: {
      value: stats.tokensUsed,
      change: tokensUsedChange,
    },
    remainingTokens: {
      value: remainingTokens,
      change: remainingTokensChange,
    },
  };
};

exports.getMessageActivityChartData = async (args) => {
  const { user_id, fromDate, toDate, period } = args;

  // Determine the grouping format based on period
  let groupFormat;
  let sortFormat;

  switch (period) {
    case "daily":
      // Group by hour for daily view
      groupFormat = { $dateToString: { format: "%H:00", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%H", date: "$start_time" } };
      break;
    case "weekly":
      // Group by day for weekly view
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
      };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
      break;
    case "monthly":
      // Group by day for monthly view
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
      };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
      break;
    case "yearly":
      // Group by month for yearly view
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%Y%m", date: "$start_time" } };
      break;
    default:
      // Default to monthly view
      groupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$start_time" },
      };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
  }

  // Get message counts grouped by time period
  const messageActivity = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: groupFormat,
        messages: { $sum: { $ifNull: ["$message_count", 1] } }, // Count messages
        tokens: { $sum: { $ifNull: ["$tokens_used", 0] } }, // Sum tokens
        sessions: { $addToSet: "$_id" }, // Count unique sessions
        sortKey: { $first: sortFormat },
      },
    },
    {
      $project: {
        _id: 0,
        time: "$_id",
        messages: 1,
        tokens: 1,
        sessions: { $size: "$sessions" },
        sortKey: 1,
      },
    },
    {
      $sort: { sortKey: 1 },
    },
  ]);

  // Format data for chart display
  const formattedData = formatChartData(
    messageActivity,
    fromDate,
    toDate,
    period
  );

  return {
    categories: formattedData.categories,
    series: [
      {
        name: "Messages",
        data: formattedData.messages,
        type: "area",
      },
      {
        name: "Tokens",
        data: formattedData.tokens,
        type: "area",
      },
      {
        name: "Sessions",
        data: formattedData.sessions,
        type: "area",
      },
    ],
  };
};

// Helper function to format chart data
function formatChartData(data, fromDate, toDate, period) {
  const categories = [];
  const messages = [];
  const tokens = [];
  const sessions = [];

  // Create a map for quick lookup
  const dataMap = new Map();
  data.forEach((item) => {
    dataMap.set(item.time, {
      messages: item.messages,
      tokens: item.tokens,
      sessions: item.sessions,
    });
  });

  // Fill in the categories and data points based on period
  if (period === "yearly") {
    // Generate months from Jan to Dec or within date range for yearly view
    const startYear = fromDate.getFullYear();
    const endYear = toDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const monthStart = year === startYear ? fromDate.getMonth() : 0;
      const monthEnd = year === endYear ? toDate.getMonth() : 11;

      for (let month = monthStart; month <= monthEnd; month++) {
        const monthName = new Date(year, month).toLocaleString("default", {
          month: "short",
        });
        const timeKey = `${year}-${String(month + 1).padStart(2, "0")}`;

        categories.push(monthName);
        const dataPoint = dataMap.get(timeKey) || {
          messages: 0,
          tokens: 0,
          sessions: 0,
        };
        messages.push(dataPoint.messages);
        tokens.push(dataPoint.tokens);
        sessions.push(dataPoint.sessions);
      }
    }
  } else if (period === "monthly" || period === "weekly") {
    // Generate days within the date range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
      const displayDate = currentDate.toLocaleString("default", {
        month: "short",
        day: "numeric",
      });

      categories.push(displayDate);
      const dataPoint = dataMap.get(dateStr) || {
        messages: 0,
        tokens: 0,
        sessions: 0,
      };
      messages.push(dataPoint.messages);
      tokens.push(dataPoint.tokens);
      sessions.push(dataPoint.sessions);

      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (period === "daily") {
    // Generate hours for the day
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      categories.push(timeStr);
      const dataPoint = dataMap.get(timeStr) || {
        messages: 0,
        tokens: 0,
        sessions: 0,
      };
      messages.push(dataPoint.messages);
      tokens.push(dataPoint.tokens);
      sessions.push(dataPoint.sessions);
    }
  }

  return { categories, messages, tokens, sessions };
}

exports.getPeakMessageTimes = async (args) => {
  const { user_id, fromDate, toDate } = args;

  // Get message counts grouped by hour of day
  const peakTimes = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $project: {
        hour: { $hour: "$start_time" },
        message_count: { $ifNull: ["$message_count", 1] },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: "$message_count" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format the data for display
  const formattedData = [];

  // Create time slots for display (e.g., "7 AM - 10:00 AM")
  const timeSlots = [
    { start: 7, end: 10, label: "7 AM - 10:00 AM" },
    { start: 10, end: 12, label: "10 AM - 12:00 PM" },
    { start: 12, end: 14, label: "12 PM - 2:00 PM" },
    { start: 14, end: 16, label: "2 PM - 4:00 PM" },
    { start: 16, end: 18, label: "4 PM - 6:00 PM" },
    { start: 18, end: 20, label: "6 PM - 8:00 PM" },
    { start: 20, end: 22, label: "8 PM - 10:00 PM" },
  ];

  // Create a map for quick lookup
  const hourCountMap = new Map();
  peakTimes.forEach((item) => {
    hourCountMap.set(item._id, item.count);
  });

  // Calculate counts for each time slot
  timeSlots.forEach((slot) => {
    let slotCount = 0;
    for (let hour = slot.start; hour < slot.end; hour++) {
      slotCount += hourCountMap.get(hour) || 0;
    }

    formattedData.push({
      timeSlot: slot.label,
      count: slotCount,
    });
  });

  return formattedData;
};

exports.getUniqueVisitors = async (args) => {
  const { user_id } = args;

  // Get current date
  const now = new Date();

  // Calculate date ranges
  const last7DaysStart = new Date(now);
  last7DaysStart.setDate(last7DaysStart.getDate() - 7);
  last7DaysStart.setHours(0, 0, 0, 0);

  const last30DaysStart = new Date(now);
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);
  last30DaysStart.setHours(0, 0, 0, 0);

  const previousPeriodStart = new Date(last30DaysStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  // Get unique visitors for last 7 days
  const last7DaysVisitors = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: last7DaysStart, $lte: now },
      },
    },
    {
      $group: {
        _id: "$from_phone_number",
      },
    },
    {
      $count: "uniqueCount",
    },
  ]);

  // Get unique visitors for last 30 days
  const last30DaysVisitors = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: last30DaysStart, $lte: now },
      },
    },
    {
      $group: {
        _id: "$from_phone_number",
      },
    },
    {
      $count: "uniqueCount",
    },
  ]);

  // Get unique visitors for previous 30 days (for growth calculation)
  const previous30DaysVisitors = await CallHistory.aggregate([
    {
      $match: {
        user_id: user_id,
        start_time: { $gte: previousPeriodStart, $lte: last30DaysStart },
      },
    },
    {
      $group: {
        _id: "$from_phone_number",
      },
    },
    {
      $count: "uniqueCount",
    },
  ]);

  // Extract counts or default to 0
  const last7Days = last7DaysVisitors[0]?.uniqueCount || 0;
  const last30Days = last30DaysVisitors[0]?.uniqueCount || 0;
  const previous30Days = previous30DaysVisitors[0]?.uniqueCount || 0;

  // Calculate growth percentage
  let growthPercentage = 0;
  if (previous30Days > 0) {
    growthPercentage = ((last30Days - previous30Days) / previous30Days) * 100;
  } else if (last30Days > 0) {
    growthPercentage = 100; // If previous was 0 and now we have visitors, that's 100% growth
  }

  return {
    last7Days,
    last30Days,
    growth: growthPercentage.toFixed(1),
  };
};

exports.getRecentMessages = async (args) => {
  const { user_id, limit = 5, page = 1, fromDate, toDate } = args;

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build match criteria
  const matchCriteria = {
    user_id: user_id,
    ...(fromDate &&
      toDate && {
        start_time: { $gte: fromDate, $lte: toDate },
      }),
  };

  // Get total count for pagination
  const totalCount = await CallHistory.countDocuments(matchCriteria);

  // Fetch recent messages with session details
  const recentMessages = await CallHistory.aggregate([
    {
      $match: matchCriteria,
    },
    {
      $lookup: {
        from: "aiagents",
        localField: "agent_id",
        foreignField: "_id",
        as: "agent",
      },
    },
    {
      $unwind: {
        path: "$agent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: { start_time: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: parseInt(limit),
    },
    {
      $project: {
        _id: 1,
        session_id: 1,
        platform: {
          $cond: [
            { $eq: ["$call_source", "web"] },
            "web",
            {
              $cond: [
                { $eq: ["$call_source", "facebook"] },
                "facebook",
                "phone",
              ],
            },
          ],
        },
        message: "$last_message",
        start_time: 1,
        from_phone_number: 1,
        email: 1,
        name: {
          $ifNull: [
            "$caller_name",
            { $concat: ["SESSION_", { $substr: ["$session_id", 0, 6] }] },
          ],
        },
      },
    },
  ]);

  // Format the data for display
  const formattedMessages = recentMessages.map((msg) => {
    // Calculate time ago
    const messageTime = new Date(msg.start_time);
    const now = new Date();
    const diffHours = Math.floor((now - messageTime) / (1000 * 60 * 60));

    let timeDisplay;
    if (diffHours < 24) {
      timeDisplay = `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      timeDisplay = `${diffDays} days ago`;
    }

    return {
      id: msg._id,
      platform: msg.platform,
      name: msg.name,
      message: msg.message || "No message content",
      time: timeDisplay,
      contact: {
        email: msg.email || "No email provided",
        phone: msg.from_phone_number || "No phone provided",
      },
    };
  });

  return {
    messages: formattedMessages,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(totalCount / limit),
    },
  };
};

/**
 * Get call data over time grouped by call source (web vs phone)
 * @param {Object} args - Arguments object
 * @param {String} args.user_id - User ID
 * @param {Date} args.fromDate - Start date
 * @param {Date} args.toDate - End date
 * @param {String} args.interval - Time interval for grouping ('hourly', 'daily', 'weekly', 'monthly')
 * @returns {Object} Chart data formatted for ApexCharts
 */
exports.getCallsBySourceOverTime = async (args) => {
  const { user_id, fromDate, toDate, interval = 'daily' } = args;

  // Configure date format and grouping based on interval
  let groupFormat, sortFormat;
  
  switch (interval) {
    case 'hourly':
      groupFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%Y%m%d%H", date: "$start_time" } };
      break;
    case 'daily':
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
      break;
    case 'weekly':
      // Group by week (using ISO week date format)
      groupFormat = { 
        $dateToString: { 
          format: "%G-W%V", // ISO year and week number
          date: "$start_time" 
        } 
      };
      sortFormat = { 
        $dateToString: { 
          format: "%G%V", 
          date: "$start_time" 
        } 
      };
      break;
    case 'monthly':
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%Y%m", date: "$start_time" } };
      break;
    default:
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } };
      sortFormat = { $dateToString: { format: "%Y%m%d", date: "$start_time" } };
  }

  // Match criteria
  const matchCriteria = {
    user_id,
    start_time: { $gte: fromDate, $lte: toDate }
  };

  // Perform aggregation to get call counts by source and time
  const callData = await CallHistory.aggregate([
    {
      $match: matchCriteria
    },
    {
      $addFields: {
        // Determine if it's a web call or phone call based on calltype field
        // If calltype is 'web-inbound' or 'web-outbound', it's a web call, otherwise it's a phone call
        callSource: {
          $cond: [
            { $or: [
              { $eq: ["$calltype", "web-inbound"] },
              { $eq: ["$calltype", "web-outbound"] }
            ]},
            "web",
            "phone"
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          timeGroup: groupFormat,
          source: "$callSource"
        },
        count: { $sum: 1 },
        sortKey: { $first: sortFormat }
      }
    },
    {
      $sort: { sortKey: 1 }
    },
    {
      $project: {
        _id: 0,
        time: "$_id.timeGroup",
        source: "$_id.source",
        count: 1
      }
    }
  ]);

  // Process results to format them for ApexCharts
  // Create separate arrays for web and phone calls
  const timeLabels = new Set();
  const webCalls = {};
  const phoneCalls = {};

  // Collect all time periods and initialize data points
  callData.forEach(item => {
    timeLabels.add(item.time);
    
    if (item.source === 'web') {
      webCalls[item.time] = item.count;
    } else {
      phoneCalls[item.time] = item.count;
    }
  });

  // Sort time labels
  const sortedTimeLabels = Array.from(timeLabels).sort();

  // Create series data in ApexCharts format
  const webSeries = sortedTimeLabels.map(time => ({
    x: time,
    y: webCalls[time] || 0
  }));

  const phoneSeries = sortedTimeLabels.map(time => ({
    x: time,
    y: phoneCalls[time] || 0
  }));

  return {
    categories: sortedTimeLabels,
    series: [
      {
        name: 'Web Calls',
        data: webSeries
      },
      {
        name: 'Phone Calls',
        data: phoneSeries
      }
    ]
  };
};

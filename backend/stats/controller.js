const { ChatSession, ChatSessionLogs, Lead } = require("../chatbot/model");
const catchAsyncError = require("../middleware/catchAsyncError");
const mongoose = require("mongoose");
const { buildChartData, periodToRange } = require("../utils");
const { getCounts, getChartData } = require("./service");
// common this query and date range logic
function init(req) {
  const { chat_model_id, from, to, period } = req.query;
  const user_id = req.user.org_id;
  const now = new Date();
  // default time range is 1 day
  const defaultFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = from ? new Date(from) : defaultFrom;
  let toDate = to ? new Date(to) : defaultTo;
  if (period !== "custom") {
    const range = periodToRange(period);
    fromDate = range.from;
    toDate = range.to;
  }

  let query = {
    chat_model_id: chat_model_id,
    created_time: {
      $gte: fromDate,
      $lt: toDate,
    },
  };
  if (period === "all") {
    delete query.created_time;
  }
  return { query, fromDate, toDate, chat_model_id, period, user_id };
}

exports.sessionsVsTime = catchAsyncError(async (req, res, next) => {
  const { query, fromDate, toDate, period = "all" } = init(req);
  const chatSessions = await ChatSession.find()
    .where(query)
    .select("_id created_time")
    .sort({ created_time: 1 });

  const seriesData = buildChartData({
    data: chatSessions,
    period,
    from: fromDate,
    to: toDate,
  });
  const series = [
    {
      name: "Users",
      data: seriesData,
    },
  ];

  res.status(200).json({
    success: true,
    data: series,
  });
});

exports.counts = catchAsyncError(async (req, res, next) => {
  const args = init(req);

  const counts = await getCounts(args);

  return res.status(200).json({
    success: true,
    data: counts,
  });
});
exports.chartData = catchAsyncError(async (req, res, next) => {
  const args = init(req);

  const { sessions, leads, chats, chatModels } = await getChartData(args);
  // build chart data
  const sessionData = buildChartData({
    data: sessions,
    period: args.period,
    from: args.fromDate,
    to: args.toDate,
  });
  const leadData = buildChartData({
    data: leads,
    period: args.period,
    from: args.fromDate,
    to: args.toDate,
  });
  const chatData = buildChartData({
    data: chats,
    period: args.period,
    from: args.fromDate,
    to: args.toDate,
  });
  const chatModelData = buildChartData({
    data: chatModels,
    period: args.period,
    from: args.fromDate,
    to: args.toDate,
  });

  return res.status(200).json({
    success: true,
    data: {
      sessions: sessionData,
      leads: leadData,
      chats: chatData,
      chatModels: chatModelData,
    },
  });
});

exports.chatsVsTime = catchAsyncError(async (req, res, next) => {
  const { query, fromDate, toDate, period, chat_model_id } = init(req);
  const result = await ChatSessionLogs.aggregate([
    {
      $lookup: {
        from: "chatsessions",
        localField: "chat_session_id",
        foreignField: "chat_session_id",
        as: "session",
      },
    },
    {
      $unwind: "$session",
    },
    {
      $match: {
        "session.chat_model_id": chat_model_id,
        ...(query.created_time !== undefined && {
          created_time: query.created_time,
        }),
      },
    },
    {
      $project: {
        created_time: "$created_time",
      },
    },
  ]);

  const seriesData = buildChartData({
    data: result,
    period,
    from: fromDate,
    to: toDate,
  });

  const series = [
    {
      name: "Chats",
      data: seriesData,
    },
  ];

  return res.status(200).json({
    success: true,
    data: series,
  });
});

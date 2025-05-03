const {
  ChatModelView,
  ChatSession,
  Lead,
  ChatSessionLogs,
} = require("../chatbot/model");

// exports.getAllChatbot = async (user_id) => {
//   return await ChatModelView.find({ user_id: user_id });
// };
function filterTimeRange(name, isValid, fromDate, toDate) {
  if (!isValid) {
    return name;
  }
  return {
    $filter: {
      input: name,
      as: "item",
      cond: {
        $and: [
          {
            $gte: ["$$item.created_time", fromDate],
          },
          {
            $lt: ["$$item.created_time", toDate],
          },
        ],
      },
    },
  };
}
exports.getCounts = async (args) => {
  const { user_id, fromDate, toDate, period, chat_model_id } = args;
  const result = await ChatModelView.aggregate([
    [
      {
        $match: {
          user_id: user_id,
          ...(chat_model_id !== undefined && { chat_model_id }),
        },
      },
      {
        $lookup: {
          from: "leads",
          localField: "chat_model_id",
          foreignField: "chat_model_id",
          as: "leads",
        },
      },
      {
        $lookup: {
          from: "chatsessions",
          localField: "chat_model_id",
          foreignField: "chat_model_id",
          as: "chatsessions",
        },
      },
      {
        $unwind: {
          path: "$chatsessions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "chatsessionlogs",
          localField: "chatsessions.chat_session_id",
          foreignField: "chat_session_id",
          as: "chats",
        },
      },
      {
        $unwind: {
          path: "$chats",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$leads",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$user_id",
          chatmodels: {
            $addToSet: {
              created_time: "$created_time",
              chat_model_id: "$chat_model_id",
            },
          },
          chatsessions: {
            $addToSet: "$chatsessions",
          },
          chats: {
            $addToSet: "$chats",
          },
          leads: {
            $addToSet: "$leads",
          },
        },
      },
      {
        $project: {
          _id: 0,
          sessions: {
            $size: filterTimeRange(
              "$chatsessions",
              period !== "all",
              fromDate,
              toDate
            ),
          },
          chats: {
            $size: filterTimeRange(
              "$chats",
              period !== "all",
              fromDate,
              toDate
            ),
          },
          chatModels: {
            $size: filterTimeRange(
              "$chatmodels",
              period !== "all",
              fromDate,
              toDate
            ),
          },
          leads: {
            $size: filterTimeRange(
              "$leads",
              period !== "all",
              fromDate,
              toDate
            ),
          },
        },
      },
    ],
  ]);
  return result[0] || {};
};

exports.getChartData = async (args) => {
  const { user_id, fromDate, toDate, period, chat_model_id } = args;
  const result = await ChatModelView.aggregate([
    [
      {
        $match: {
          user_id: user_id,
          ...(chat_model_id !== undefined && { chat_model_id }),
        },
      },
      {
        $lookup: {
          from: "leads",
          localField: "chat_model_id",
          foreignField: "chat_model_id",
          as: "leads",
        },
      },
      {
        $lookup: {
          from: "chatsessions",
          localField: "chat_model_id",
          foreignField: "chat_model_id",
          as: "chatsessions",
        },
      },
      {
        $unwind: {
          path: "$chatsessions",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "chatsessionlogs",
          localField: "chatsessions.chat_session_id",
          foreignField: "chat_session_id",
          as: "chats",
        },
      },
      {
        $unwind: {
          path: "$chats",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$leads",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$user_id",
          chatmodels: {
            $addToSet: {
              created_time: "$created_time",
              chat_model_id: "$chat_model_id",
            },
          },
          chatsessions: {
            $addToSet: "$chatsessions",
          },
          chats: {
            $addToSet: "$chats",
          },
          leads: {
            $addToSet: "$leads",
          },
        },
      },
      {
        $project: {
          _id: 0,
          sessions: {
            $sortArray: {
              input: filterTimeRange(
                "$chatsessions",
                period !== "all",
                fromDate,
                toDate
              ),
              sortBy: { created_time: 1 }, // Sorting by created_time in ascending order
            },
          },
          chats: {
            $sortArray: {
              input: filterTimeRange(
                "$chats",
                period !== "all",
                fromDate,
                toDate
              ),
              sortBy: { created_time: 1 }, // Sorting by created_time in ascending order
            },
          },
          chatModels: {
            $sortArray: {
              input: filterTimeRange(
                "$chatmodels",
                period !== "all",
                fromDate,
                toDate
              ),
              sortBy: { created_time: 1 }, // Sorting by created_time in ascending order
            },
          },
          leads: {
            $sortArray: {
              input: filterTimeRange(
                "$leads",
                period !== "all",
                fromDate,
                toDate
              ),
              sortBy: { created_time: 1 }, // Sorting by created_time in ascending order
            },
          },
        },
      },
    ],
  ]);
  return result[0] || {};
};

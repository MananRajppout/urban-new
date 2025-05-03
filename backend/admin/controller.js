require("dotenv").config();
const catchAsyncError = require("../middleware/catchAsyncError");
const { getIntegratesAdded } = require("../integrates/impl");
const { getChatbotDetailsForDashboard } = require("../chatbot/impl");

const { User } = require("../user/model");
const { ChatModel, ChatHistory, ChatSession } = require("../chatbot/model");

exports.dashboard = catchAsyncError(async (req, res, next) => {
  try {
    const { startTime, endTime, type } = req.query;
    if (type == "constraint") {
      // Convert timestamps to Date objects
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const users = await User.find({
        created_time: { $gte: startDate, $lte: endDate },
      }).select("email");
      const user_count = users.length; //users.count()
      return res.status(200).json({
        success: true,
        message: "success",
        total_user_count: user_count,
      });
    }

    const users = await User.find().select("email");
    const user_count = users.length; //users.count()
    return res.status(200).json({
      success: true,
      message: "success",
      total_user_count: user_count,
    });
  } catch (error) {
    console.log("getUserCount SYSTEM ERROR : ", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});



exports.userDetails = catchAsyncError(async (req, res, next) => {
//   var response = {};
  const page = parseInt(req.query.page) || 1;
  const per_page = parseInt(req.query.per_page) || 10;

  const users = await User.aggregate([
    {
        $sort: { created_time: -1 }
    },
    {
        $skip: (page - 1) * per_page
    },
    {
        $limit: per_page
    },
    {
        $lookup: {
          from: "restrictions",
          let: { userId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$user_id", "$$userId"]
                }
              }
            }
          ],
          as: "restrictions"
        }
    },
    {
      $unwind: { path: "$restrictions", preserveNullAndEmptyArrays: true }
    },
    {
        $lookup: {
            from: "chatmodelviews",
            let: { userId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_id", "$$userId"]
                  }
                }
              }
            ],
            as: "chatmodelviews"
        }
    },
    {
        $group: {
          _id: "$_id",
          user: { $first: "$$ROOT" },
          totalChatViews: { $sum: { $size: "$chatmodelviews" } },
          totalCharacters: {
            $sum: {
                $cond: [
                    { $isArray: "$chatmodelviews" },
                    { $sum: { $ifNull: ["$chatmodelviews.number_of_characters", 0] } },
                    0
                ]
            }
        }
      }
    },
    {
        $project: {
          "_id": "$user._id",
          "full_name":"$user.full_name",
          "profile_image":"$user.profile_image",
          "email": "$user.email",
          "is_active":"$user.is_active",
          "created_time": "$user.created_time",
          "pricing_plan": "$user.pricing_plan",
          "restrictions": "$user.restrictions",
          "chatbot_count": "$totalChatViews",
          "totalCharacters": "$totalCharacters"
        }
    }
  ]);


//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];
//     var chatbot_details = await getChatbotDetailsForDashboard(user.id);
//     response[user.id] = {
//       ...user["_doc"],
//       ...chatbot_details,
//     };
//   }

  return res
    .status(200)
    .json({ success: true, message: "success", response: users });
});


// exports.accessUserAnalytics = catchAsyncError(async (req, res, next) => {
//     const email = req.query.email;

//     // Find the user based on the provided email
//     const user = await User.findOne({ email });

//     if (!user) {
//         return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Assuming chatbot data is stored within the user document
//     const chatbots = await ChatModel.find({ user_id: user._id });

//     // Array to store conversations for each chatbot
//     const conversations = [];

//     // Loop through each chatbot
//     for (const chatbot of chatbots) {
//         const startDate = new Date(user.created_time);
//         const endDate = new Date();
//         const pipeline = [
//             {
//                 $match: {
//                     created_time: { $gte: startDate, $lte: endDate },
//                     chat_model_id: chatbot.id,
//                 },
//             },

//             {
//                 $lookup: {
//                     from: "chatsessionlogs",
//                     let: { chatSessionId: "$chat_session_id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ["$chat_session_id", "$$chatSessionId"] },
//                             },
//                         },
//                         {
//                             $project: {
//                                 _id: 0,
//                                 user_msg: 1,
//                                 chatbot_reply: 1,
//                             },
//                         },
//                     ],
//                     as: "logs",
//                 },
//             },
//         ];

//         // Aggregate chat sessions for each chatbot
//         const chatSessions = await ChatSession.aggregate(pipeline);

//         // Add chat sessions to the array
//         conversations.push({
//             chatbot_id: chatbot._id,
//             chat_sessions: chatSessions,
//         });
//     }

//     // Generate HTML for the conversations
//     let htmlContent = "<html><body>";
//     conversations.forEach(chatbot => {
//         htmlContent += `<h3>Chatbot ID: ${chatbot.chatbot_id}</h3>`;
//         chatbot.chat_sessions.forEach(session => {
//             session.logs.forEach(log => {
//                 htmlContent += `<div><strong>User Message:</strong> ${log.user_msg}</div>`;
//                 htmlContent += `<div><strong>Chatbot Reply:</strong> ${log.chatbot_reply}</div>`;
//                 htmlContent += "<hr>";
//             });
//         });
//     });
//     htmlContent += "</body></html>";

//     // Return the HTML content
//     return res.status(200).send(htmlContent);
// });

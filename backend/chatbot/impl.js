const { User } = require("../user/model");
const { PricePlan } = require("../pricing/model");
const {
  ChatModel,
  ChatModelView,
  ChatBotSourceDetail,
  ChatBotSource,
  ChatSession,
  ChatSessionLogs,
} = require("./model");
const { getRestriction } = require("../user/impl");
const axios = require("axios");
const { getUniqueFileName } = require("../utils/infra");
const fs = require("fs");
const { Integrate } = require("../integrates/model");

const {
  createIndexPineCone,
  deleteNamespacePinecone,
  getChatbotContextPincone,
} = require("./langchain");

const OpenAI = require("openai");
const PinconeController = require("./pincone");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pController = new PinconeController();

async function getPricingPlan(user_id) {
  const user_obj = await User.findById(user_id).populate("pricing_plan");
  
  if (!user_obj.pricing_plan) {
    const pricing_plan = await PricePlan.findById("65237a7da3b9006e7db54d47");
    return pricing_plan; // Please remove this in production
  }
  console.log("this function may be called here")
  return user_obj.pricing_plan;
}

async function getChatCompletionForIntegrates(chatbot_model_id, user_msg) {
  var messages = [];
  var chatModel = await ChatModel.findOne({ id: chatbot_model_id });

  const restriction = await getRestriction(chatModel.user_id);
  if (
    restriction.consumed_messages_user + 1 >
    restriction.quota_messages_user
  ) {
    return "";
  }

  restriction.consumed_messages_user = restriction.consumed_messages_user + 1;
  restriction.save();

  const context = await getChatbotContextByChatModel(chatModel, user_msg);

  messages.push({
    role: "system",
    content: chatModel.base_prompt + ". context:" + context,
  });
  messages.push({ role: "user", content: user_msg });

  const GPTOutput = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  return GPTOutput.choices[0].message.content;
}

// Here is the the session logic, which is going to create single record for a session and multiple for each messages, means one to find all the respective unique sessions as per chatbot
// chat_session_id is being created in the frontend
async function createChatHistory(
  chat_model_id,
  user_msg,
  chatbot_reply,
  chat_session_id,
  confidence
) {
  var chatLogPayload = {
    chat_session_id: chat_session_id,
    user_msg: user_msg,
    chatbot_reply: chatbot_reply,
    confidence_score: confidence,
  };
  await ChatSessionLogs.create(chatLogPayload);
  const _findChatSession = await ChatSession.findOne({
    chat_session_id: chat_session_id,
  });
  if (!_findChatSession) {
    await ChatSession.create({
      chat_model_id: chat_model_id,
      user_msg: user_msg,
      chatbot_reply: chatbot_reply,
      chat_session_id: chat_session_id,
    });
  }
}

function getReadAndEditableChatModelFields() {
  return ["chatgpt_model_type", "base_prompt", "temperature", "calendly_url"];
}

async function deleteChatbot(chat_model_id) {
  await ChatModelView.deleteOne({ chat_model_id: chat_model_id });

  await ChatModel.deleteOne({ id: chat_model_id });
  await ChatBotSourceDetail.deleteMany({ chat_model_id: chat_model_id });
  await ChatBotSource.deleteMany({ chat_model_id: chat_model_id });
  return true;
}

// Please do not use this function until and unless you donot need it
async function deleteAllChatbot(user_id) {
  const chatBotObjects = await ChatModelView.find({ user_id: user_id });

  for (const chatBotObject of chatBotObjects) {
    await deleteChatbot(chatBotObject.chat_model_id);
  }
  return true;
}

async function getChatModelViewCount(user_id) {
  try {
    const chat_model_response = await ChatModelView.countDocuments({
      user_id: user_id,
    }).exec();
    return chat_model_response;
  } catch (error) {
    console.log("Error in getChatModelViewCount :", error);
    return 0;
  }
}

async function getChatbotContext(embedding_filename, question) {
  const response_chatbot_controller = await axios.post(
    `http://127.0.0.1:8000/chatbot-controller`,
    {
      action: "context",
      embedding_filename: embedding_filename,
      question: question,
    }
  );
  const response = response_chatbot_controller.data.message;
  return response;
}

async function createEmbeddings(training_data) {
  const file_name = process.env.STATIC_FILES + getUniqueFileName();
  await fs.writeFileSync(file_name, training_data);

  const response_chatbot_controller = await axios.post(
    `http://127.0.0.1:8000/chatbot-controller`,
    {
      action: "train",
      training_data_filename: file_name,
    }
  );

  const response = response_chatbot_controller.data.message;
  return response;
}

// async function getChatbotContextByChatModel(chat_model, question){
//     if (!chat_model.embedding_filename || !fs.existsSync(chat_model.embedding_filename)){
//         chat_model.embedding_filename = await createEmbeddings(chat_model.training_data);
//         await chat_model.save()
//     }
//     return await getChatbotContext(chat_model.embedding_filename, question);
// }

// -> pincone index[empty]_chatbot_id -> [][]

async function getChatbotContextByChatModel(chat_model, question) {
  try {
    if (!chat_model.is_context_set) {
      chat_model.is_context_set = true;
      // createIndexPineCone(chat_model.id, chat_model.training_data);
      pController.storeContext(chat_model.training_data, chat_model.id);
      chat_model.save();
      return {};
    }
    // return await getChatbotContextPincone(chat_model.id, question);
    //============================================make dynamic topk value by aayush =========================================

    const topkvalue = "urbanchat-z1" === chat_model.chatgpt_model_type ? 3 : 10;
    return await pController.getSimilarContext(
      question,
      chat_model.id,
      topkvalue
    );
  } catch (e) {
    console.log("Error in getChatbotContextByChatModel ", e);
    return {};
  }
}

async function updateChatbotContext(chat_model) {
  try {
    await deleteNamespacePinecone(chat_model.id);
    await createIndexPineCone(
      chat_model.id,
      chat_model.training_data,
      chat_model.user_id
    );
    return true;
  } catch (e) {
    console.log("Error in updateChatbotContext ", e);
    return false;
  }
}

async function getChatbotDetailsForDashboard(user_id) {
  var chatbots = await ChatModelView.find({ user_id: user_id }).select(
    "name number_of_characters"
  );
  let totalCharacters = 0;
  for (const chatbot of chatbots) {
    totalCharacters += chatbot.number_of_characters;
  }

  var integrated_details = {
    is_whatsapp_integrated: false,
    is_facebook_integrated: false,
    is_shopify_integrated: false,
    is_wordpress_integrated: false,
  };

  if (await Integrate.exists({ user_id: user_id, type: "whatsapp" })) {
    integrated_details["is_whatsapp_integrated"] = true;
  }

  if (await Integrate.exists({ user_id: user_id, type: "facebook" })) {
    integrated_details["is_facebook_integrated"] = true;
  }

  var response = {
    ...integrated_details,
    totalCharacters,
    chatbot_count: chatbots.length,
  };
  return response;
}

function getGeminiModels() {
  return ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
}

module.exports = {
  getPricingPlan,
  getChatCompletionForIntegrates,
  getReadAndEditableChatModelFields,
  createChatHistory,
  deleteAllChatbot,
  getChatModelViewCount,
  createEmbeddings,
  getChatbotContext,
  getChatbotContextByChatModel,
  getChatbotDetailsForDashboard,
  updateChatbotContext,
  getGeminiModels,
};

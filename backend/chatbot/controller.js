require("dotenv").config();
const catchAsyncError = require("../middleware/catchAsyncError");
const {
  ChatModel,
  ChatModelView,
  ChatBotSourceDetail,
  ChatBotSource,
  Lead,
  ChatSession,
  ChatSessionLogs,
} = require("./model");
const handlebars = require("handlebars");
const pdf = require("html-pdf");
const https = require("https");

const { Integrate } = require("../integrates/model");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const { getRestriction } = require("../user/impl");

const {
  getFileType,
  getStringOfTxtFile,
  readFileFromS3,
  sendMailFun,
} = require("../utils/infra");
const {
  getPricingPlan,
  getReadAndEditableChatModelFields,
  createChatHistory,
  getChatbotContextByChatModel,
  updateChatbotContext,
  getGeminiModels,
} = require("./impl");

const axios = require("axios");
const fs = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const { fetchTranscript } = require("./youtube");
const { pipeline } = require("stream");
const { getChatHisotryPipline } = require("./query");
const path = require("path");
const { User } = require("../user/model");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function getCharacterLimit(user_id, chatbot_id) {
  const pricing_plan = await getPricingPlan(user_id);
  var chat_model_view = await ChatModelView.findOne({
    chat_model_id: chatbot_id,
  });
  return pricing_plan.allowed_characters - chat_model_view.number_of_characters;
}

async function deleteS3object(bucket, key) {
  s3.deleteObject({ Bucket: bucket, Key: key }, function (err, data) {
    if (err) {
      console.error("Error deleting S3 object:", key, "Error: ", err);
    }
  });
  return true;
}

async function retrain_chatbot(chatbot_id) {
  try {
    var chat_model_view = await ChatModelView.findOne({
      chat_model_id: chatbot_id,
    });
    var training_data = "";

    var chatBotSources = await ChatBotSource.find({
      chat_model_id: chatbot_id,
    });
    for (const chatBotSource of chatBotSources) {
      training_data += `\n` + chatBotSource.source_data;
    }

    // mongo query-----------
    // Fetch the chat model
    const chatModel = await ChatModel.findOne({ id: chatbot_id });

    // Update training data
    chatModel.training_data += training_data;
    await chatModel.save();
    // -------------

    // dynamo query-----------
    // var chatModel = await ChatModel.get({ id: chatbot_id });
    // chatModel.training_data += training_data;
    // await chatModel.save()
    // ------------------------

    chat_model_view.status = "trained";
    chat_model_view.last_mod_time = Date.now();
    chat_model_view.last_trained = Date.now();
    chat_model_view.number_of_characters = training_data.length;
    await chat_model_view.save();

    await updateChatbotContext(chatModel);
  } catch (error) {
    console.log(
      "Error while retraining the chatbot retrain_chatbot error : ",
      error
    );
  }
  return true;
}

async function start_training_bot_for_files(
  chatbot_id,
  new_sources_length,
  chat_model_view = {}
) {
  try {
    if (!chat_model_view) {
      chat_model_view = await ChatModelView.findOne({
        chat_model_id: chatbot_id,
      });
    }
    chat_model_view.status = "training";
    await chat_model_view.save();

    var new_training_data = "";

    var chatSourceDetails = await ChatBotSourceDetail.find({
      chat_model_id: chatbot_id,
      type: "file",
      status: "created",
    });
    for (const chatSourceDetail of chatSourceDetails) {
      const file_type = getFileType(chatSourceDetail.name);
      // lambda function api to extract data from s3 files
      const extractor_reponse = await axios.post(
        `https://q1sg2wtof5.execute-api.us-east-1.amazonaws.com/default/pdfExtractor`,
        {
          bucket: process.env.CRAWLER_BUCKET_NAME,
          key: `uploads/${chatSourceDetail._id}`,
          file_type: file_type,
        }
      );
      // data has been extracted so we don't need the s3 file, lets clear some space
      deleteS3object(
        process.env.CRAWLER_BUCKET_NAME,
        `uploads/${chatSourceDetail._id}`
      );

      if (
        new_training_data.length + extractor_reponse.data.text.length >
        new_sources_length
      ) {
        await ChatBotSourceDetail.deleteOne({ id: chatSourceDetail.id });
        continue;
      }
      chatSourceDetail.num_of_characters = extractor_reponse.data.text.length;
      chatSourceDetail.status = "trained";
      await chatSourceDetail.save();

      await ChatBotSource.create({
        chat_model_id: chatbot_id,
        source_data: extractor_reponse.data.text,
        chat_bot_source_detail_id: chatSourceDetail._id,
      });

      new_training_data += `\n` + extractor_reponse.data.text;
    }

    // mongo query
    await ChatModel.findOneAndUpdate(
      { id: chatbot_id },
      { $push: { training_data: new_training_data } }
    );

    // dynamodb query
    // var chatModel = await ChatModel.get({ id: chatbot_id });
    // chatModel.training_data += new_training_data;
    // await chatModel.save()

    chat_model_view.status = "trained";
    chat_model_view.last_mod_time = new Date.now();
    chat_model_view.last_trained = new Date.now();
    chat_model_view.number_of_characters += new_training_data.length;
    await chat_model_view.save();
  } catch (error) {
    console.log("start_training_bot_for_files Error : ", error);
  }
}

//OLD BASE PROMPT
// function getDefaultChatbotPrompt() {
// 	return `I want you to act as a support agent. Your name is "AI Assistant". You will provide me with answers from the given info. If the answer is not included, say exactly "Hmm, I am not sure." and stop after that. Refuse to answer any question not about the info. Never break character.`
// }

function getDefaultChatbotPrompt() {
  return `I want you to act as a ai customer support representative. Analyse the information provided and your task is to help me with all the queries from the provided information only. Refuse to answer any question not about the info. Keep your responses informative, short and straight to the point. Never break character.`;
}

// Function to send quota exceed email
const emailSentCache = {}; // In-memory cache to store user IDs and dates

async function sendQuotaExceedEmail(user_id, userEmail) {
  const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
  const lastSentDate = emailSentCache[user_id];

  if (lastSentDate !== today) {
    const ctx = {};
    await sendMailFun("message_quota_exceed", ctx, userEmail);
    emailSentCache[user_id] = today; // Update the date in the cache
  }
}

async function newChatbot(data_body, user_id, mod_by) {
  try {
    const new_chatbot_id = uuidv4();

    var newChatView = new ChatModelView({
      chat_model_id: new_chatbot_id,
      number_of_characters: data_body.length,
      user_id: user_id,
      last_mod_by: mod_by,
    });
    await newChatView.save();

    var newChatModel = {
      id: new_chatbot_id,
      user_id: user_id,
      chatgpt_model_type: "gpt-4o",
      base_prompt: getDefaultChatbotPrompt(),
      training_data: data_body,
      temperature: 0,
      is_context_set: false,

      type: "standard",
      is_alive: true,
      last_mod_by: mod_by,
    };
    await ChatModel.create(newChatModel);
    return new_chatbot_id;
  } catch (error) {
    console.log("newChatbot Error", error);
    return 0;
  }
}

exports.createChatbot = catchAsyncError(async (req, res, next) => {
  var { data_type, data_body } = req.body;

  const pricing_plan = await getPricingPlan(req.user.org_id);
  const current_running_chatbots = await ChatModelView.countDocuments({
    user_id: req.user.org_id,
  });
  if (current_running_chatbots + 1 > pricing_plan.number_of_chatbots) {
    return res.status(500).json({
      message:
        "You've reached the maximum number of chatbots allowed on your current plan. To create more chatbots, please upgrade your plan.",
    });
  }

  // if (data_type == 'text'){
  // 	chatbot_id, error = await newChatbot(data_body, req.user_id);
  // }
  const chatbot_id = await newChatbot("", req.user.org_id, req.user.id);

  if (chatbot_id == 0) {
    console.log("Error while creating the new chatbot, error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
  return res
    .status(200)
    .json({ message: "Chatbot created successfully", chatbot_id: chatbot_id });
});

exports.editChatbot = catchAsyncError(async (req, res, next) => {
  const { chatbot_id } = req.query;
  const model_keys = getReadAndEditableChatModelFields();

  var model_update = {};

  model_keys.forEach((key) => {
    if (req.body[key] !== undefined) {
      model_update[key] = req.body[key];
      delete req.body[key];
    }
  });

  if (req.body) {
    // for ChatbotView (MONGODB table)
    var chatbotView = await ChatModelView.findOne({
      chat_model_id: chatbot_id,
    });
    var pricePlan = await getPricingPlan(chatbotView.user_id);

    for (const key in req.body) {
      if (req.body[key] !== undefined) {
        // Check if the key is 'remove_powered_by' and the price plan is 'Hobby' or 'Free'
        if (
          key === "remove_powered_by" &&
          req.body["remove_powered_by"] === true &&
          (pricePlan.name === "Hobby" || pricePlan.name === "Free")
        ) {
          // Return an error indicating that 'remove_powered_by' cannot be updated
          return res.status(403).json({
            message:
              "Upgrade your current plan to remove the 'Powered by' watermark.",
          });
        }
        // Update other fields
        chatbotView[key] = req.body[key];
      }
    }
    await chatbotView.save();
  }

  if (model_update) {
    //mongodb query------------------
    const chatModel = await ChatModel.findOne({ id: chatbot_id });

    model_keys.forEach((key) => {
      if (model_update[key] !== undefined) {
        chatModel[key] = model_update[key];
      }
    });

    await chatModel.save();

    // dynamo-db query----------------
    // var chatModel = await ChatModel.get({ id: chatbot_id });

    // model_keys.forEach((key) => {
    // 	if (model_update[key] !== undefined) {
    // 		chatModel[key] = model_update[key];
    // 	}
    // });
    // await chatModel.save();
  }
  return res.status(200).json({ message: "Chatbot updated successfully" });
});

exports.chatCompletion = catchAsyncError(async (req, res, next) => {
  try {
    const { chatbot_id, chat_session_id } = req.body;
    let chat_messages = req.body.messages;

    const pick_last_msgs_length = Math.min(chat_messages.length, 7) * -1;
    let messages = chat_messages.slice(pick_last_msgs_length);

    const user_msg = messages[messages.length - 1].content;

    let chatbot_reply = "";

    const chatModel = await ChatModel.findOne({ id: chatbot_id });
    const restriction = await getRestriction(chatModel.user_id);
    if (
      restriction.consumed_messages_user + 1 >
      restriction.quota_messages_user
    ) {
      const user = await User.findById(chatModel.user_id);
      await sendQuotaExceedEmail(chatModel.user_id, user.email);
      return res.status(401).send("");
    }
    restriction.consumed_messages_user += 1;
    await restriction.save();

    const { context = "", confidence = 0 } = await getChatbotContextByChatModel(
      chatModel,
      user_msg
    );

    let calendlyBasePrompt = "";
    if (chatModel.calendly_url) {
      calendlyBasePrompt = `If asked for booking a meeting, respond only with: "To book an appointment kindly fill up the details... book_meeting".`;
    }

    const systemMessage = `
		${chatModel.base_prompt} This is the base prompt.
		You are a highly intelligent, adaptive, and professional A I assistant and your primary objective is to follow the base prompt provided by the user which outlines specific instructions and guidelines that reflect the unique requirements and goals of the business or website you are assisting and reply in detail.
		- Handle greetings naturally.
		- Use Markdown formatting to emphasize important parts in your replies, such as **bold** for key points, *Italicize* important terms, \`Inline code\` for commands and use lists and headings

    CONTEXT: [${context}]

	 Additional Instructions: -${calendlyBasePrompt}

  You are an advanced AI assistant with the ability to detect and respond in the same language as the user.

	${chatModel.base_prompt} This is the base prompt.
		You are a highly intelligent, adaptive, and professional A I assistant and your primary objective is to follow the base prompt provided by the user which outlines specific instructions and guidelines that reflect the unique requirements and goals of the business or website you are assisting and reply in detail.
		- Handle greetings naturally.
		- Use Markdown formatting to emphasize important parts in your replies, such as **bold** for key points, *Italicize* important terms, \`Inline code\` for commands and use lists and headings

	 Additional Instructions: -${calendlyBasePrompt}
		 `;

    messages = [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ];

    /* const userMessagePrompt = (message) => `
     User Query: "${message}"

     Your task is to respond based on the above CONTEXT only. If the query is not covered in the CONTEXT, respond with "I'm not sure about this."
     `;

     messages.push({
      role: "user",
      content: userMessagePrompt(user_msg)
      }); */

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (getGeminiModels().includes(chatModel.chatgpt_model_type)) {
      const model = genAI.getGenerativeModel({
        model: chatModel.chatgpt_model_type,
      });

      // Convert messages array into a readable string format
      const formattedMessages = messages
        .map((msg) => {
          return `${msg.role === "user" ? "User" : "Assistant"}: ${
            msg.content
          }`;
        })
        .join("\n\n"); // Separate each message with a double newline for clarity

      const geminiPrompt = `${systemMessage}Conversation:\n\n${formattedMessages}\n\nReply to this user query: ${user_msg}`;

      const result = await model.generateContentStream(geminiPrompt);

      for await (const chunk of result.stream) {
        res.write(chunk.text());
      }
      return res.end();
    }

    //here we are using mistral-7b-instruct for english hindi or hinegnlish but in front-end show
    // as as urbanchat z-1 model
    else if ("urbanchat-z1" === chatModel.chatgpt_model_type) {
      const requestData = {
        model: "Mistral-7B-Instruct",
        messages: messages,
        frequency_penalty: 0.5,
        logprobs: true,
        top_logprobs: 2,
        max_tokens: 158,
        n: 1,
        presence_penalty: 0.5,
        response_format: { type: "text" }, // Response as plain text
        stream: false, // Ensure it's not a streaming response
        temperature: 1,
        top_p: 0.5,
      };

      try {
        //  Sending API request
        const response = await axios.post(
          "https://cloud.olakrutrim.com/v1/chat/completions",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer fACzNv81cP4Eu7A81B2P-FuGGTxzM`,
            },
          }
        );

        //  Extracting the message content from API response
        const userResponse =
          response?.data?.choices?.[0]?.message?.content || "";

        console.log(userResponse, "check for user responses");
        // 🛠 Breaking response into smaller chunks (50 characters each)
        const chunks = userResponse.match(/.{1,50}/g) || []; // Handle empty response case

        //  Sending response in chunks for better performance
        for (const chunk of chunks) {
          res.write(chunk);
        }

        //  Ending the response
        return res.end();
      } catch (error) {
        console.log("API Error:", error.message, error); //  Log error for debugging

        //  Sending user-friendly error message
        res.write(
          "We're currently unavailable, but we'd be happy to assist you shortly. Please try again in a little while."
        );
        return res.end();
      }
    } else {
      // do chatcompletion with chatgpt
      const completion = await openai.chat.completions.create({
        model: chatModel.chatgpt_model_type,
        messages: messages,
        temperature: chatModel.temperature,
        stream: true,
      });

      // Note: Below code should not be changed in any case because it is responsible to host the chunks
      // console.log(completion, completion.response, Object.keys(completion.response));
      const stream = completion;
      for await (const chunk of completion) {
        if (chunk.choices[0].delta.content == undefined) {
          createChatHistory(
            chatbot_id,
            user_msg,
            chatbot_reply,
            chat_session_id,
            confidence
          );
          return res.end();
        }
        chatbot_reply += chunk.choices[0].delta.content;
        res.write(chunk.choices[0].delta.content);
      }
    }
  } catch (error) {
    console.log("chatCompletion: Error :", error);
    return res.send(
      "We're currently unavailable, but we'd be happy to assist you shortly. Please try again in a little while."
    );
  }
});

exports.createChatSource = catchAsyncError(async (req, res, next) => {
  try {
    const { chatbot_id, source_type } = req.query;
    // var { new_sources_length } = req.body; //not used as of now
    if (!chatbot_id) {
      return res
        .status(400)
        .json({ message: "Chatbot ID is required to complete this request" });
    }

    if (source_type == "file") {
      const uploadedFiles = Object.values(req.files);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded." });
      }

      const uploadPromises = uploadedFiles.map(async (file) => {
        var chat_bot_detail = await ChatBotSourceDetail.create({
          chat_model_id: chatbot_id,
          user_id: req.user.org_id,
          type: source_type,
          name: file.name,
          status: "created",
        });

        const file_buffer = fs.readFileSync(file.tempFilePath);

        const s3Params = {
          Bucket: process.env.CRAWLER_BUCKET_NAME,
          Key: `uploads/${chat_bot_detail._id}`, // Specify the S3 path where you want to store the file
          Body: file_buffer,
        };

        await s3.upload(s3Params).promise();

        // fs.unlink(file.tempFilePath); // for to remove the /tmp files
      });
      await Promise.all(uploadPromises);

      const pricing_plan = await getPricingPlan(req.user.org_id);
      var chat_model_view = await ChatModelView.findOne({
        chat_model_id: chatbot_id,
      });

      start_training_bot_for_files(
        chatbot_id,
        pricing_plan.allowed_characters - chat_model_view.number_of_characters,
        chat_model_view
      );
    } else if (source_type == "text" || source_type == "qa") {
      var text_source;
      if (source_type == "qa") {
        text_source = JSON.stringify(req.body.qa_list);
      } else {
        text_source = req.body.text_source;
      }

      const max_char_threshold = await getCharacterLimit(
        req.user._id,
        chatbot_id
      );
      if (text_source.length > max_char_threshold) {
        return res.status(500).json({
          message: "Threshold exceeded ! Please check your character limit",
        });
      }

      const chatSourceDetail = await ChatBotSourceDetail.create({
        chat_model_id: chatbot_id,
        user_id: req.user._id,
        type: source_type,
        status: "trained",
        num_of_characters: text_source.length,
      });

      // actually we already storing the source in model but still for the backup we are goonna store it in this below table also
      await ChatBotSource.create({
        chat_model_id: chatbot_id,
        source_data: text_source,
        chat_bot_source_detail_id: chatSourceDetail._id,
      });

      var chatModel = await ChatModel.findOne({ id: chatbot_id });
      chatModel.training_data += text_source;

      var chat_model_view = await ChatModelView.findOne({
        chat_model_id: chatbot_id,
      });
      chat_model_view.number_of_characters += text_source.length;
      chat_model_view.last_trained = new Date();

      await chat_model_view.save();
      await chatModel.save();
    }

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error while creating the new chatbot source, error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.deleteChatSource = catchAsyncError(async (req, res, next) => {
  try {
    const { chatbot_detail_ids, chatbot_id } = req.body;
    await ChatBotSourceDetail.deleteMany({
      _id: { $in: chatbot_detail_ids },
      chat_model_id: chatbot_id,
      user_id: req.user.org_id,
    });
    await ChatBotSource.deleteMany({
      chat_bot_source_detail_id: { $in: chatbot_detail_ids },
      chat_model_id: chatbot_id,
    });

    retrain_chatbot(chatbot_id);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("deleteChatSource Error :", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.deleteAllChatSources = catchAsyncError(async (req, res, next) => {
  try {
    const { chatbot_id } = req.params;

    // Delete all chat sources and details associated with the chatbot
    await ChatBotSourceDetail.deleteMany({
      chat_model_id: chatbot_id,
      user_id: req.user.org_id,
    });
    await ChatBotSource.deleteMany({ chat_model_id: chatbot_id });

    // Retrain the chatbot after deletion
    await retrain_chatbot(chatbot_id);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("deleteAllChatSources Error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
});

exports.scarperWithCrawler = catchAsyncError(async (req, res, next) => {
  try {
    const { action, chatbot_id, source_keys } = req.body;
    var response = [];
    if (action == "fetch") {
      payload_for_crawler = {
        url: source_keys[0],
      };

      if (req.body.site_map) {
        payload_for_crawler["site_map"] = "true";
      }

      // const response_crawler = await axios.post(`http://localhost:8000/web-crawler`, payload_for_crawler);
      // response = response_crawler.data.message;

      // http://crawler-alb-1699209958.eu-south-1.elb.amazonaws.com/ : AWS
      //
      const response_crawler = await axios.post(
        `https://4.232.129.10/`,
        payload_for_crawler,
        { httpsAgent: agent }
      );
      response = response_crawler.data.source_keys;
    } else if (action == "push") {
      var chatModel = await ChatModel.findOne({ id: chatbot_id });
      var chat_model_view = await ChatModelView.findOne({
        chat_model_id: chatbot_id,
      });

      // applied parllel processing
      await Promise.all(
        source_keys.map(async (source_key) => {
          const text_source = await readFileFromS3(
            process.env.CRAWLER_BUCKET_NAME,
            source_key["file_name"]
          );
          if (!text_source) {
            console.error(
              "No text data found in file - ",
              source_key["file_name"]
            );
            return;
          }

          const chatSourceDetail = await ChatBotSourceDetail.create({
            chat_model_id: chatbot_id,
            user_id: req.user.org_id,
            type: "url",
            status: "trained",
            num_of_characters: text_source.length,
            url: source_key["url"],
          });

          ChatBotSource.create({
            chat_model_id: chatbot_id,
            source_data: text_source,
            chat_bot_source_detail_id: chatSourceDetail._id,
          });

          chatModel.training_data += text_source + " " + source_key["url"];
          chat_model_view.number_of_characters += source_key["text_length"];
        })
      );

      const currentTime = Date.now();
      chat_model_view.last_trained = currentTime;
      chatModel.is_context_set = false;
      await chat_model_view.save();
      await chatModel.save();
    }

    return res.status(200).json({ message: "success", response });
  } catch (error) {
    console.log("scarperWithCrawler :", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.fetchChatbotSourcesDetails = catchAsyncError(async (req, res, next) => {
  // GET API
  const { chatbot_id, data_type, chat_bot_source_detail_id } = req.query;
  if (data_type == "detail") {
    const chatbot_sources_details = await ChatBotSourceDetail.find({
      user_id: req.user.org_id,
      chat_model_id: chatbot_id,
    });
    return res
      .status(200)
      .json({ message: "success", chatbot_sources_details });
  } else if (data_type == "source") {
    // ONLY for to fetch the text and Q/A
    const chatbot_source = await ChatBotSource.find({
      chat_bot_source_detail_id: chat_bot_source_detail_id,
      chat_model_id: chatbot_id,
    });
    return res.status(200).json({ message: "success", chatbot_source });
  }
});

exports.editChatbotSource = catchAsyncError(async (req, res, next) => {
  try {
    const {
      chatbot_id,
      chat_bot_source_detail_id,
      updated_data,
      updated_data_type,
    } = req.body;
    var chatbot_source = await ChatBotSource.findOne({
      chat_bot_source_detail_id: chat_bot_source_detail_id,
      chat_model_id: chatbot_id,
    });
    if (updated_data_type == "text") {
      chatbot_source.source_data = updated_data;
      await chatbot_source.save();
    } else if (updated_data_type == "qa") {
      chatbot_source.source_data = JSON.stringify(updated_data);
      retrain_chatbot(chatbot_id);
      await chatbot_source.save();
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("editChatbotSource: ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.myChatbots = catchAsyncError(async (req, res, next) => {
  try {
    const { type } = req.query;
    var view_response;
    var chatbot_model_response = {};
    var integrate_details = {};
    if (type == "summary") {
      view_response = await ChatModelView.find({
        user_id: req.user.org_id,
      }).select("name chat_model_id bot_picture");
    } else {
      integrate_details["is_whatsapp_integrated"] = false;
      integrate_details["is_facebook_integrated"] = false;
      integrate_details["is_shopify_integrated"] = false;
      integrate_details["is_wordpress_integrated"] = false;

      view_response = await ChatModelView.find({
        chat_model_id: req.query.chat_model_id,
      });
      chatbot_model = await ChatModel.findOne({ id: req.query.chat_model_id });

      getReadAndEditableChatModelFields().forEach((key) => {
        if (chatbot_model[key] !== undefined) {
          chatbot_model_response[key] = chatbot_model[key];
        }
      });
      if (
        await Integrate.exists({
          chat_model_id: req.query.chat_model_id,
          type: "whatsapp",
        })
      ) {
        integrate_details["is_whatsapp_integrated"] = true;
      }

      if (
        await Integrate.exists({
          chat_model_id: req.query.chat_model_id,
          type: "facebook",
        })
      ) {
        integrate_details["is_facebook_integrated"] = true;
      }
    }
    return res.status(200).json({
      message: "success",
      view: view_response,
      chatbot_model: chatbot_model_response,
      integrate_details,
    });
  } catch (error) {
    console.log("myChatbots : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.deleteChatbot = catchAsyncError(async (req, res, next) => {
  try {
    const { chat_model_id } = req.query;

    await ChatModelView.deleteOne({ chat_model_id: chat_model_id });

    await ChatModel.deleteOne({ id: chat_model_id });

    await ChatBotSourceDetail.deleteMany({
      chat_model_id: chat_model_id,
      user_id: req.user.org_id,
    });
    await ChatBotSource.deleteMany({ chat_model_id: chat_model_id });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("deleteChatbot Error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.createLead = catchAsyncError(async (req, res, next) => {
  try {
    await Lead.create(req.body);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("createLead Error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.fetchLeads = catchAsyncError(async (req, res, next) => {
  try {
    const { startTime, endTime, chat_model_id } = req.query;

    // Validate the timestamps
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Start time and end time are required." });
    }

    // Convert timestamps to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Fetch leads within the specified time range
    const leads = await Lead.find({
      created_time: { $gte: startDate, $lte: endDate },
      chat_model_id: chat_model_id,
    });

    return res.status(200).json({ message: "success", leads });
  } catch (error) {
    console.log("fetchLeads Error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.fetchChatHistory = catchAsyncError(async (req, res, next) => {
  const { startTime, endTime, chat_session_id, chat_model_id } = req.query;
  const data = req.query.data || "summary";
  // Validate the timestamps
  if (data == "summary" && (!startTime || !endTime)) {
    return res
      .status(400)
      .json({ error: "Start time and end time are required." });
  }

  if (chat_model_id) {
    const _findChatbot = await ChatModelView.findOne({
      user_id: req.user.org_id,
      chat_model_id: chat_model_id,
    });
    if (!_findChatbot) {
      return res.status(401).json({
        success: false,
        error: "Chatbot does not exist in the account",
      });
    }
  }

  const page = req.query.page || 1;
  const per_page = req.query.per_page || 10;

  if (data == "summary") {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    var pipeline = getChatHisotryPipline(
      page,
      per_page,
      chat_model_id,
      startDate,
      endDate
    );

    const chatSessions = await ChatSession.aggregate(pipeline);
    return res.status(200).json({ success: true, chatSessions });
  } else if (data == "chatlog") {
    const chatSessionLogs = await ChatSessionLogs.find({
      chat_session_id: chat_session_id,
    })
      .sort({ created_time: -1 })
      .skip((page - 1) * per_page)
      .limit(parseInt(per_page));

    return res.status(200).json({ success: true, logs: chatSessionLogs });
  }
  return res.status(200).json({ message: "success" });
});

exports.fetchMyChatbot = catchAsyncError(async (req, res, next) => {
  try {
    view_response = await ChatModelView.find({
      chat_model_id: req.query.chat_model_id,
    });
    chatbot_model = await ChatModel.findOne({ id: req.query.chat_model_id });

    const chatbot_model_response = {};

    getReadAndEditableChatModelFields().forEach((key) => {
      if (chatbot_model[key] !== undefined) {
        chatbot_model_response[key] = chatbot_model[key];
      }
    });

    return res.status(200).json({
      message: "success",
      view: view_response,
      chatbot_model: chatbot_model_response,
    });
  } catch (error) {
    console.log("fetchChatHistory Error : ", error);
    return res.status(500).json({
      message: "Something went wrong, Please try again after some time",
    });
  }
});

exports.verifyLink = catchAsyncError(async (req, res, next) => {
  const { url } = req.body;
  payload_for_crawler = {
    url: url,
    site_map: "true",
  };

  const response_crawler = await axios.post(
    `http://localhost:8000/web-crawler`,
    payload_for_crawler
  );
  response = response_crawler.data.message;
  if (!response) {
    return res
      .status(200)
      .json({ message: "Not verified Link ", verified: false });
  }
  return res.status(200).json({ message: "Verified", verified: true });
});

exports.getChatbotWithShopify = catchAsyncError(async (req, res, next) => {
  const { shopify_store_url } = req.query;
  if (!shopify_store_url) {
    return res
      .status(300)
      .json({ message: "Please provide a shopify url", success: false });
  }
  const chatbot = await ChatModelView.findOne({
    shopify_store_url: shopify_store_url,
  });
  if (!chatbot) {
    return res.status(300).json({
      message: "Chatbot is not avaialbe with respect to url",
      success: true,
    });
  }
  return res.status(200).json({
    chatbot_id: chatbot.chat_model_id,
    message: "Chatbot Found",
    success: true,
  });
});

exports.youtubeTranscript = catchAsyncError(async (req, res, next) => {
  const { action, source_keys, chatbot_id, url } = req.body;

  if (action == "fetch") {
    const { transcript_filename, characters } = await fetchTranscript(url);
    if (!characters) {
      return res.status(300).json({
        message: "Transcript is not available for this video",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Youtube transcript found !",
      file_name: transcript_filename,
      text_length: characters,
      url: url,
    });
  } else if (action == "push") {
    var chatModel = await ChatModel.findOne({ id: chatbot_id });
    var chat_model_view = await ChatModelView.findOne({
      chat_model_id: chatbot_id,
    });

    for (const source_key of source_keys) {
      //{"url":url, "file_name":file_name, "text_length":text_length}
      const text_source = getStringOfTxtFile(source_key["file_name"]);
      const chatSourceDetail = await ChatBotSourceDetail.create({
        chat_model_id: chatbot_id,
        user_id: req.user.org_id,
        type: "youtubeTranscript",
        status: "trained",
        num_of_characters: text_source.length,
        url: source_key["url"],
      });

      await ChatBotSource.create({
        chat_model_id: chatbot_id,
        source_data: text_source,
        chat_bot_source_detail_id: chatSourceDetail._id,
      });

      chatModel.training_data += text_source;
      chat_model_view.number_of_characters += source_key["text_length"];
    }

    const currentTime = Date.now();
    chat_model_view.last_trained = currentTime;
    chatModel.is_context_set = false; // for to retrain the chatbot automaticly

    await chat_model_view.save();
    await chatModel.save();

    return res.status(200).json({ success: true, message: "Chatbot Trained" });
  }

  return res.status(500).json({
    message: "Request can't be completed due to some client side issue",
    success: false,
  });
});

exports.createChatHistoryPdf = catchAsyncError(async (req, res, next) => {
  const { startTime, endTime, chat_model_id } = req.query;
  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ error: "Start time and end time are required." });
  }

  if (chat_model_id) {
    const _findChatbot = await ChatModelView.findOne({
      user_id: req.user.org_id,
      chat_model_id: chat_model_id,
    });
    if (!_findChatbot) {
      return res.status(401).json({
        success: false,
        error: "Chatbot does not exist in the account",
      });
    }
  }
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  var pipeline = getChatHisotryPipline(
    "full",
    null,
    chat_model_id,
    startDate,
    endDate
  );

  const chatSessions = await ChatSession.aggregate(pipeline);

  var action = "chat_history";
  const file_name = `../templates/${action}.html`;
  const template_path = path.join(__dirname, file_name);

  fs.readFile(template_path, "utf8", (error, htmlTemplate) => {
    if (error) {
      console.error("Error reading email template:", error);
      return;
    }
    const template = handlebars.compile(htmlTemplate);
    const personalizedHtml = template({ chatSessions: chatSessions });

    // Options for pdf generation
    const pdfOptions = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    };

    pdf.create(personalizedHtml, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return;
      }
      // Send the PDF as a response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=chat_history.pdf"
      );
      return res.send(buffer);
    });
  });
});

/*
	ChatModel [is having the frequent accessed data]
	|
	| (connected with chat_model_id)
	ChatModelView [For to store the configuratino and view details]

	Similar for chatbot source

	chatBotSourceDetail [for to capture how many chatsoureces are associated with a chatbot ]
	chatBotSource [For to store the source ]

*/

/* first createChatbot-> then only going to perform the extraction */

//Trigger chatbot training
exports.triggerChatbotTraining = catchAsyncError(async (req, res, next) => {
  try {
    const { chatbot_id } = req.query;

    // Getting chatbot model using the provided chatbot ID
    const chatModel = await ChatModel.findOne({ id: chatbot_id });
    if (!chatModel) {
      return res
        .status(404)
        .json({ message: "Chatbot model not found", success: false });
    }

    //  Get chatbot context asynchronously without awaiting the result
    getChatbotContextByChatModel(chatModel, "");

    // Success response
    return res
      .status(200)
      .json({ message: "Started retraining chatbot", success: true });
  } catch (error) {
    console.log("triggerChatbotTraining: Error:", error);
    return res.status(500).json({
      message: "An error occurred while triggering training",
      success: false,
    });
  }
});

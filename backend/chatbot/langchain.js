require("dotenv").config();
const { PineconeStore } = require("@langchain/community/vectorstores/pinecone");
const { initializeDatabase, splitTextToChunks } = require("./langchain_utils");
const OpenAI = require("openai");
const { APIGateway } = require("aws-sdk");
const WebNotification = require("../utils/notification");

const createIndexPineCone = async (chatbotId, context, user_id) => {
  try {
    // console.log("I'm here in the createIndexPineCone fn")
    const chunk = await splitTextToChunks(context);
    const db = await initializeDatabase();

    const storeContext = await PineconeStore.fromDocuments(
      chunk,
      db.embeddings,
      {
        pineconeIndex: db.index,
        namespace: chatbotId,
      }
    );

    if (!storeContext) {
      throw new Error("Failed to index context in Pinecone Database.");
    }

    const notification = new WebNotification()
    notification.trainingChatbot({ user_id:user_id, chatmodel_id:chatbotId});
    
    return {
      status: 201,
      success: true,
      message: "Data indexed to vector database succesfully",
    };
  } catch (error) {
    return {
      status: 401,
      success: false,
      message: "Something went wrong",
      error: error,
    };
  }
};

// createIndexPineCone("chatbot-1-123", dummyContext);

// DELETE request to index data into a namespace in pinecone database
const deleteNamespacePinecone = async (chatbotId) => {
  try {
    const db = await initializeDatabase();

    const ns = await db.index.namespace(chatbotId);

    // delete the entire namespace
    await ns.deleteAll();

    return {
      status: 201,
      success: true,
      message: "Namespace records deleted successfully",
    };
  } catch (error) {
    return {
      status: 401,
      success: false,
      message: "Something went wrong",
      error: error,
    };
  }
};
// deleteNamespacePinecone("chatbot-1-123");

// Query data in a namespace in Pinecone vector database
const queryDataInNamespace = async (chatbotId, query, base_prompt) => {
  try {
    const db = await initializeDatabase();

    const vectorStore = await PineconeStore.fromExistingIndex(db.embeddings, {
      pineconeIndex: db.index,
      namespace: chatbotId,
    });

    const queryDB = await vectorStore.similaritySearch(query, 1);

    // console.log(
    //   `Database similarity search output: \n ${JSON.stringify(queryDB)} \n\n\n`
    // );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            base_prompt +
            `The current data includes: ${queryDB[0].pageContent}. \n You understand the user's needs and provide accurate and helpful information based on this data.`,
        },
        {
          role: "user",
          content: `${query}`,
        },
      ],
    });

    const response = completion.choices[0].message.content;

    // console.log("OpenAI response: \n", response);
    return response;
  } catch (error) {
    return "";
  }
};

// queryDataInNamespace("chatbot-1-123", dummyQuery);

async function getChatbotContextPincone(chatbot_id, question) {
  const db = await initializeDatabase();

  const vectorStore = await PineconeStore.fromExistingIndex(db.embeddings, {
    pineconeIndex: db.index,
    namespace: chatbot_id,
  });

  const similarData = [];
  const queryDB = await vectorStore.similaritySearch(question, 8);
  // console.log("query DB =====> ", queryDB);
  queryDB.map((result) => {
    similarData.push(result.pageContent);
  });

  return similarData;
}

module.exports = {
  createIndexPineCone,
  deleteNamespacePinecone,
  getChatbotContextPincone,
  queryDataInNamespace,
};

require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
// const { RecursiveCharacterTextSplitter } = await import('langchain/text_splitter');
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const splitTextToChunks = async (context) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4000,
    chunkOverlap: 400,
  });

  const splitText = await textSplitter.createDocuments([context]);

  // console.log(splitText);
  return splitText;
};

const initializeDatabase = async () => {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    // environment: process.env.PINECONE_ENVIRONMENT,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX);

  return {
    index,
    embeddings,
  };
};

module.exports = {
  splitTextToChunks,
  initializeDatabase,
};

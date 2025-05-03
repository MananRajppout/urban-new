require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { splitTextToChunks } = require("./langchain_utils");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

class OpenAIHelper {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }
  async getEmbedding(text, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/embeddings",
          {
            model: "text-embedding-ada-002",
            input: text,
          },
          {
            headers: {
              Authorization: `Bearer ${this.openaiApiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data.data[0].embedding;
      } catch (error) {
        attempts += 1;
        console.error(`Error (attempt ${attempts}):`, error.message, error);

        if (attempts >= maxRetries) {
          console.error("Max retries reached. Skipping this text vector.");
          return []; // Return an empty embedding to indicate failure
        }

        // wait time incresed for every re attempt so there is maximum chances of get embeddings
        const waitTime = Math.pow(2, attempts) * 1000;
        // console.log(`Waiting for ${waitTime} ms before next retry...`);
        await new Promise((res) => setTimeout(res, waitTime));
      }
    }
  }
}

class PinconeController {
  constructor() {
    this.maxRecordsforQuery = 3;
    this.batchUpsertMax = 50;
    this.batchEmbeddingMax = 20;
    this.openAiHelper = new OpenAIHelper();
    this.pinconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  async getPClientWithNamespace(namespace) {
    const pClient = await this.pinconeClient
      .Index(process.env.PINECONE_INDEX, process.env.PINCONE_INDEX_HOSTURL)
      .namespace(namespace);
    return pClient;
  }

  async batchUpsert(pClient, embeddingVectors, batchSize) {
    const batches = [];

    // Split embeddingVectors into batches
    for (let i = 0; i < embeddingVectors.length; i += batchSize) {
      batches.push(embeddingVectors.slice(i, i + batchSize));
    }

    // Process batches concurrently
    await Promise.all(
      batches.map(async (batch) => {
        await pClient.upsert(batch);
      })
    );
  }

  async getBatchEmbeddings(textVectors) {
    var embeddingVectors = [];

    const batchSize = this.batchEmbeddingMax; // batch to get embeddings, batch size vectors of chunks will be proceed concurrently at a time
    const totalBatches = Math.ceil(textVectors.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min((i + 1) * batchSize, textVectors.length);
      // console.log('start: ' + start, 'end: ' + end)
      const textVectors_ = textVectors.slice(start, end); // A single batch
      // let count = 0;
      await Promise.all(
        textVectors_.map(async (textVector, i) => {
          const embedding = await this.openAiHelper.getEmbedding(
            textVector.pageContent
          );
          // count = count + 1;
          embeddingVectors.push({
            values: embedding,
            id: uuidv4(),
            metadata: {
              body: textVector.pageContent,
            },
          });
        })
      );
    }
    return embeddingVectors;
  }

  async storeContext(context, namespace) {
    console.log("Training started of chatbot ", namespace, " !");

    const pClient = await this.getPClientWithNamespace(namespace);
    const textVectors = await splitTextToChunks(context);
    // console.log('text vector length---->', textVectors.length);

    const embeddingVectors = await this.getBatchEmbeddings(textVectors);

    console.log(":: AFTER EMBEDDINGS ::"); // DEBUG:ONLY
    await this.batchUpsert(pClient, embeddingVectors, this.batchUpsertMax);

    console.log("Training completed of chatbot ", namespace, " !");
    return true;
  }

  async getSimilarContext(
    query,
    namespace,
    topkvalue = this.maxRecordsforQuery
  ) {
    var similarContext = [];
    const pClient = await this.getPClientWithNamespace(namespace);
    const queryVector = await this.openAiHelper.getEmbedding(query);

    // ===================add top k value dynamic based on model ============================
    const response = await pClient.query({
      topK: topkvalue,
      vector: queryVector,
      includeMetadata: true,
    });
    // filter matches which score is > 0.7
    response.matches = response.matches.filter((match) => match.score > 0.7);
    let sum = 0;
    response.matches.forEach((match) => {
      if (match.metadata && match.metadata.body) {
        similarContext.push(match.metadata.body);
      }
      sum += match.score;
    });
    const averageScore =
      response.matches.length > 0 ? sum / response.matches.length : 0;
    const confidence = Math.round(averageScore * 100) / 100;

    return {
      context: similarContext,
      confidence,
    };
  }
}

module.exports = PinconeController;

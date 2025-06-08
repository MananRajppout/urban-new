import dotenv from "dotenv";
dotenv.config();

const env = {
  PLIVO_AUTH_ID: process.env.PLIVO_AUTH_ID || "",
  PLIVO_AUTH_TOKEN: process.env.PLIVO_AUTH_TOKEN || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  BACKEND_SERVER_URL: process.env.BACKEND_SERVER_URL || "",
  SARVAM_API_KEY: process.env.SARVAM_API_KEY || "",
  SMALLEST_AI_API_KEY: process.env.SMALLEST_AI_API_KEY || "",
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || "",
  GROK_API_KEY: process.env.GROK_API_KEY || "",
};

// get all undefined keys
const undefinedKeys = Object.keys(env).filter(
  (key) => !env[key as keyof typeof env]
);
if (undefinedKeys.length) {
  throw new Error(`Missing environment variables: ${undefinedKeys.join(", ")}`);
}

export default env;

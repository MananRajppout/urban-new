require("dotenv").config();
const { serve } = require("@hono/node-server");
const { Hono } = require("hono");
const { logger } = require("hono/logger");
const { twiml } = require("twilio");
const OpenAI = require("openai");
const { getCookie, setCookie } = require("hono/cookie");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = new Hono();
app.use("*", logger());

const INITIAL_MESSAGE = "Hello, how are you?";

app.get("/health", (c) => {
  return c.text("hiii");
});

app.post("/incoming-call", (c) => {
  const voiceResponse = new twiml.VoiceResponse();
  if (!getCookie(c, "messages")) {
    // This is a new conversation!
    voiceResponse.say(INITIAL_MESSAGE);
    setCookie(
      c,
      "messages",
      JSON.stringify([
        {
          role: "system",
          content: `
          You are a helpful phone assistant for a pizza restaurant.
          The restaurant is open between 10-12 pm.
          You can help the customer reserve a table for the restaurant.
        `,
        },
        { role: "assistant", content: INITIAL_MESSAGE },
      ])
    );
  }
  voiceResponse.gather({
    input: ["speech"],
    speechTimeout: "auto",
    speechModel: "experimental_conversations",
    enhanced: true,
    action: "/respond",
  });
  c.header("Content-Type", "application/xml");
  return c.body(voiceResponse.toString());
});

app.post("/respond", async (c) => {
  const formData = await c.req.formData();
  const voiceInput = formData.get("SpeechResult")?.toString();
  let messages = JSON.parse(getCookie(c, "messages"));
  messages.push({ role: "user", content: voiceInput });
  console.log("voiceinput is ", voiceInput);

  if (voiceInput.toLowerCase().includes("transfer")) {
    const voiceResponse = new twiml.VoiceResponse();
    voiceResponse.say("Transferring your call, please hold.");
    voiceResponse.dial("+919234869224"); // Replace with the number to transfer the call to
    // voiceResponse.say("Good bye");
    c.header("Content-Type", "application/xml");
    return c.body(voiceResponse.toString());
  }

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
  });
  const assistantResponse = chatCompletion.choices[0].message.content;
  messages.push({ role: "assistant", content: assistantResponse });
    console.log(assistantResponse);
  setCookie(c, "messages", JSON.stringify(messages));
  const voiceResponse = new twiml.VoiceResponse();
  voiceResponse.say(assistantResponse);
  voiceResponse.redirect({ method: "POST" }, "/incoming-call");
  c.header("Content-Type", "application/xml");
  return c.body(voiceResponse.toString());
});


const port = 3000;
console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});

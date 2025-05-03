require('dotenv').config();
const { twiml } = require('twilio');
const OpenAI = require('openai');
const catchAsyncError = require('../middleware/catchAsyncError');
const { VoiceAi } = require('./model');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


exports.twilioInComingCall = catchAsyncError(async (req, res, next) => {
  const voiceResponse = new twiml.VoiceResponse();
  const cookies = req.cookies;

  if (!cookies || !cookies.messages) {
    
    const voiceModel = await VoiceAi.find({phone_number:req.body.Called});

    // const voiceModel = {
    //   "_id": {
    //     "$oid": "666277862b75c0031d34e994"
    //   },
    //   "base_prompt": `You are a helpful phone assistant for a pizza restaurant.\n          The restaurant is open between 10-12 pm.\n          You can help the customer reserve a table for the restaurant.`,
    //   "chatgpt_model_type": "gpt-3.5-turbo",
    //   "phone_number": "+14237197457",
    //   "temperature": {
    //     "$numberLong": "0"
    //   },
    //   "user_id": "---emty",
    //   "initial_message": "Hello, how are you?"
    // }

    voiceResponse.say(voiceModel.initial_message);

    res.cookie('messages',
      JSON.stringify([
        {
          role: 'system',
          content: voiceModel.base_prompt,
        },
        { role: 'assistant', content: voiceModel.initial_message },
      ])
    );

    // req.body.chatgpt_model_type = voiceModel.chatgpt_model_type;
    // req.body.temperature = voiceModel.temperature;
  }

  voiceResponse.gather({
    input: ['speech'],
    speechTimeout: 'auto',
    speechModel: 'experimental_conversations',
    enhanced: true,
    // bargeIn: true,
    action: '/api/respond',
  });

  res.setHeader('Content-Type', 'application/xml');
  res.send(voiceResponse.toString());
});

exports.twilioCallRespond = catchAsyncError(async (req, res, next) => {
  console.log(req.body, 'hello there')
  const formData = req.body;
  const voiceInput = formData.SpeechResult ? formData.SpeechResult.toString() : ''

  let messages = JSON.parse(req.cookies.messages || '[]');
  messages.push({ role: 'user', content: voiceInput });

  // NOTE: don't use the below code until we go with training voice ai
  // const pick_last_msgs_length = Math.min(messages.length, 7) * -1;
  // messages = messages.slice(pick_last_msgs_length);

  if (voiceInput.toLowerCase().includes('transfer')) {
    const voiceResponse = new twiml.VoiceResponse();
    voiceResponse.say('Transferring your call, please hold.');
    voiceResponse.dial('+917014165534'); // Replace with the number to transfer the call to
    res.setHeader('Content-Type', 'application/xml');
    return res.send(voiceResponse.toString());
  }

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
  });

  console.log(chatCompletion)
  
  const assistantResponse = chatCompletion.choices[0].message.content;
  messages.push({ role: "assistant", content: assistantResponse });

  // Set the cookie before sending the response
  res.cookie('messages', JSON.stringify(messages));

  const voiceResponse = new twiml.VoiceResponse();
  voiceResponse.say(assistantResponse);
  voiceResponse.redirect({ method: "POST" }, "/api/incoming-call");
  res.setHeader('Content-Type', 'application/xml');
  res.send(voiceResponse.toString());
});
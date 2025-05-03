const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const DeepGramVoiceHelper = require("./deepgram");
const ElevenLabsVoiceHelper = require("./elevenlabs");
const { CallHistory, CallSessionLogs } = require("./model");
const { CreditCard } = require("../pricing/model");
const { User } = require("../user/model");
const PollyVoiceHelper = require("./polly_handler");
const { v4: uuidv4 } = require('uuid');
const awsPolly = new PollyVoiceHelper();
const elevenlabs = new ElevenLabsVoiceHelper();
const deepgram = new DeepGramVoiceHelper()
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const {
    loopBackgroundSound,
    mergeSounds,
    changeSpeed,
    getAudioDuration,
    processAudio
} = require('./background_voice_merger');
const { twiml } = require("twilio");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel");

const get_system_prompt = (base_prompt) => {
    return `You are an AI virtual assistant handling phone calls. Your primary function is to follow guidelines from the base prompt while maintaining natural conversation. You must analyze the caller's intent in every interaction:

    1.⁠ ⁠Human-like Speech Patterns:
    • Keep responses concise and natural, typically one sentence
    • Insert a '•' symbol at natural speech pauses
    • Use contractions (e.g., "I'm" instead of "I am")
    • Incorporate casual phrases (e.g., "sure thing" instead of "certainly")
    • Vary your tone based on context
    • Use conversational fillers naturally (like "well," "you know," "actually")
    • Avoid robotic or overly formal language

    2.⁠ ⁠Speech Formatting:
    • Numbers: Convert to spoken form (e.g., "123" becomes "one two three")
    • Currency: Use spoken format (e.g., "$50" becomes "fifty dollars")
    • Time: Use conversational format (e.g., "2:30 PM" becomes "two thirty p.m.")
    • Dates: Use natural format (e.g., "Jan 5th" becomes "January fifth")

    3.⁠ ⁠Error Recovery:
    • If intent is unclear, ask for clarification
    • If system error occurs, apologize naturally

    Remember:
    •⁠  ⁠Never break character
    •⁠  ⁠Stay within the scope of provided information
    •⁠  ⁠Keep conversation flowing naturally
    •⁠  ⁠If uncertain about any request, err on the side of transferring to a human agent
    base_prompt : "${base_prompt}"`;
}

const default_base_prompt = `## Identity and Role
You are Sofia, the friendly receptionist for urbanchat Smiles Dental Clinic. Your job is to help callers with questions about our services and book appointments. Always be warm and approachable, like you're chatting with a friend. Keep your responses short and sweet, just like a real person would on the phone.

## Services and Pricing
We offer these services. Mention only name of services do not mention prices unless caller asked for the price:
Regular check-ups and cleanings are about eighty dollars. •• •  Teeth whitening starts at two hundred dollars. ••  Dental implants? They're around fifteen hundred dollars per tooth. • • Root canal treatment is roughly eight hundred to twelve hundred dollars. • Braces and aligners start from three thousand dollars for a full treatment. • Emergency dental care depends, but typically starts at one hundred fifty dollars.

## Appointment Booking
When someone wants to book, here's what to do:
1. Ask for their name and phone number. Be casual, like: "Great! Can I get your name and the best number to reach you?"
2. If they only give one, ask for the other: "Thanks for that. Could I also get your [name/phone number]?"
3. Once you have both, ask about the day and time they prefer: "When would you like to come in? We're open Monday to Friday, 9 AM to 6 PM, and Saturdays from 9 to 2."
4. Confirm everything back to them: "Alright, so I've got [name] booked for [day] at [time], and we'll call [phone number] if anything changes. Does that sound good?"
5. If they confirm, say something like: "Perfect! You're all set. We'll see you then!"

If they don't want to give their info, just say: "No worries! We do need this info to book you in, though. Feel free to call back when you're ready to schedule."

## Handling Tricky Situations
* If someone asks something you're not sure about, be honest: "You know, I'm not 100% sure about that. But I can definitely get one of our dentists to give you a call with more info. Would that be okay?"
* For medical advice, always say: "I'd love to help, but for specific medical questions, it's best to chat with one of our dentists. They can give you the most accurate info during your appointment."

## When to Transfer or End Calls
* Transfer the call (using “transfer_call”) if:
  - Someone asks to speak to a specific person
  - They have a complex medical question
  - They seem upset or frustrated
  Just say: "I understand. Let me connect you with someone who can help better. One moment, please."

* End the call (use “end_call” function) when:
  - The conversation is naturally wrapping up
  - You've answered all their questions or booked their appointment
  Say something like: "Is there anything else I can help with today? No? Alright then, thanks for calling Bright Smiles. Have a great day!"

## General Tips
* Use everyday language, like "Hey there!" or "No problem at all!"
* If you're not sure about something, it's okay to say, "Let me double-check that for you."
* Always aim to be helpful. If you can't do something, suggest an alternative.

Remember, you're representing Bright Smiles Dental Clinic. Keep it friendly, keep it simple, and always try to make the caller feel welcomed and valued!`;

const createCallHistory = catchAsyncFunc(async (payload, aiAgentObj) => {
    //expecting some values in the payload itself like : start_time, caller_id
    payload['user_id'] = aiAgentObj?.user_id
    payload['voice_engine_id'] = aiAgentObj?.voice_id
    payload['voice_id'] = aiAgentObj?.voice_id
    payload['voice_name'] = aiAgentObj?.voice_name
    payload['agent_id'] = aiAgentObj?._id
    payload['chatgpt_model'] = aiAgentObj?.chatgpt_model
    payload['twilio_phone_number'] = aiAgentObj?.twilio_phone_number
    payload['agent_id'] = aiAgentObj?._id
    payload['voice_name'] = aiAgentObj?.voice_name
    payload['voice_id'] = aiAgentObj?.voice_id

    await CallHistory.create(payload)
});

// Function to get the default credit card
async function getDefaultCreditCard(userId) {
  try {
    // Fetch the default credit card for the user and customer
    const defaultCard = await CreditCard.findOne({
      user_id: userId,
      is_default: true
    }).exec();

    // Check if a default card is found
    if (!defaultCard) {
      return { message: 'Default credit card not found', card: null };
    }

    // Return the default card
    return { message: 'Default credit card found', card: defaultCard };
  } catch (error) {
    // Handle potential errors
    console.error('Error fetching default credit card:', error);
    throw new Error('An error occurred while fetching the default credit card');
  }
}

const createCallSessionLogs = catchAsyncFunc(async (payload) => {
    await CallSessionLogs.create(payload);
});

// Removing catchAsyncFunc wrapper for getVoiceEngine
const getVoiceEngine = async (voice_engine_name='elevenlabs') => {
    if (voice_engine_name == 'deepgram'){
        return deepgram;
    }
    return elevenlabs;
}; 

const getVoiceRespUrl = async (
    text, 
    aiAgent = {}
) => {
    // Destructure the necessary properties from aiAgent with default values
    const {
        voice_id: voiceId = null, 
        voice_engine_name: voiceEngineName = 'deepgram', 
        ambient_sound: ambientSound = null, 
        voice_speed: playbackSpeed = 1, 
        ambient_sound_volume: ambientSoundVolume = 0.3,
        language_code: language_code = 'en-US',
        fallback_voice_ids: fallbackVoiceIds = ''
    } = aiAgent;

    const audioFileName = `${uuidv4()}.mp3`;

    const voiceEngines = [
        { name: voiceEngineName, voiceId: voiceId }
    ];
    
    const fallbackEngines = fallbackVoiceIds.split(',').map(id => id.trim()).filter(Boolean);
    for (const fallback of fallbackEngines) {
        const [engineName, ...voiceIdParts] = fallback.split('-');
        const voiceId = voiceIdParts.join('-');
        voiceEngines.push({ name: engineName, voiceId });
    }

    console.log('fallbackEngines', voiceEngines)

    // console.log("voice engine names and ids: ", voiceEngines);

    let finalVoiceFilePath;

    for (const { name: engineName, voiceId } of voiceEngines) {
        try {

            const voiceEngine = await getVoiceEngine(engineName);

            // Ensure that voiceEngine exists and create MP3 file
            if (!voiceEngine) {
                throw new Error(`Voice engine ${engineName} not found.`);
            }

            await voiceEngine.createMp3File(text, voiceId, audioFileName, language_code);
            const voiceFilePath = path.resolve(process.env.DOCKER_EBS_PATH, audioFileName);

            if (playbackSpeed !== 1) {
                const speedAdjustedFilePath = path.resolve(process.env.DOCKER_EBS_PATH, `${uuidv4()}_speed.mp3`);
                await changeSpeed(voiceFilePath, speedAdjustedFilePath, playbackSpeed);
                finalVoiceFilePath = speedAdjustedFilePath;
            } else {
                finalVoiceFilePath = voiceFilePath;
            }

            if (ambientSound) {
                const tempLoopedAmbientPath = path.resolve(process.env.DOCKER_EBS_PATH, `${uuidv4()}_bg.mp3`);
                const mergedOutputPath = path.resolve(process.env.DOCKER_EBS_PATH, `${uuidv4()}_merged.mp3`);

                const finalOutputWithBg = await processAudio(
                    finalVoiceFilePath, 
                    `${process.env.DOCKER_EBS_PATH}/ambient_sounds/${ambientSound}.mp3`, 
                    mergedOutputPath, 
                    tempLoopedAmbientPath, 
                    ambientSoundVolume
                );

                finalVoiceFilePath = finalOutputWithBg;
            }

            return await voiceEngine.getCdnAudioUrl(path.basename(finalVoiceFilePath));

        } catch (error) {
            console.error(`Voice engine ${engineName} with voice ID ${voiceId} failed. Error:`, error);
            // Continue to next engine if the current one fails
        }
    }
};

const generateSystemPrompt = (aiAgent) => {
    const { base_prompt, boosted_keywords, enable_speech_normalization, calendar_tools } = aiAgent || {};
    let systemPrompt = '';

    // Add the base prompt if available
    if (base_prompt) {
        systemPrompt += get_system_prompt(`## User Instructions: ${base_prompt}\n`);
    } else {
        systemPrompt += get_system_prompt(`## User Instructions:${default_base_prompt}\n`)
    }

    // Include boosted keywords instruction if available
    if (boosted_keywords?.trim()) {
        systemPrompt += `- Please include the following keywords in your response if applicable: "${boosted_keywords}".\n`;
    }

    // Include speech normalization instruction if enabled
    if (enable_speech_normalization) {
        systemPrompt += `- Normalize the response by converting specific elements into their spoken forms for accurate pronunciation. For example:
        1. Written: "Call me at 213-711-2342 between 9am-5pm on Jul 5th, 2024. The project budget is $50,000."
           Spoken: "Call me at two one three, seven one one, two three four two between nine a.m. to five p.m. on July fifth, twenty twenty-four. The project budget is fifty thousand dollars."
        2. Written: "Your appointment is on Jul 10th, 2024, at 2pm at 123 3rd Avenue. The cost will be $75.50."
           Spoken: "Your appointment is on July tenth, twenty twenty-four, at two p.m. at one two three Third Avenue. The cost will be seventy-five dollars fifty cents."\n`;
    }

    // Include calendar tool instructions if available
    if (calendar_tools && calendar_tools.length > 0) {
        const calApiKey = calendar_tools[0].cal_api_key || '';
        const eventAI = calendar_tools[0].cal_event_type_id || '';
        const calTimezone = calendar_tools[0].cal_timezone || 'America/Los_Angeles';

        systemPrompt += `## Booking Appointment Instructions\n
        Whenever you're checking for an appointment, you need to start by asking the user for the date and time they want. Make sure they provide it clearly and confirm the details clearly (day, month, year, and time in 24-hour format) before proceeding. You can say something like, 'Please provide your preferred date and time.' Make sure booking data and time must be in the future.\n

        Once you have the date and time, follow these steps:

        1. Check availability: Use the provided date and time, along with the following details, to check if the slot is available:
        - calApiKey: ${calApiKey}
        - eventAI: ${eventAI}
        - calTimezone: ${calTimezone} (Use this for converting the date and time into the appropriate timestamp format).\n

        2. If the slot is available: Confirm the user's name and email twice. You, as the assistant, must spell out each character of the email address, for example: "Is your email j o h n one two three at the rate g m a i l dot com?" Ensure to verify this carefully with the user.\n

        3. Once confirmed, proceed to book the appointment by calling the \`bookAppointment\` function, passing the following:
        - calApiKey: ${calApiKey}
        - eventAI: ${eventAI}
        - calTimezone: ${calTimezone}
        - User's name and email\n

        4. If the slot is not available: Politely inform the user that the chosen time is not available, and suggest they provide an alternative date and time.\n`;
    }

    return systemPrompt.trim();
};

const handleReminders = (voiceInput, reminderCount, maxReminders, res) => {
    // Handle scenarios where the voice input is empty or invalid
    if (!voiceInput || voiceInput.trim() === '') {
        const newReminderCount = reminderCount + 1;
        res.cookie("reminder_curr_count", newReminderCount);
        console.log('new reminder count',newReminderCount,maxReminders);
        if (newReminderCount >= maxReminders) {
            const voiceResponse = new twiml.VoiceResponse();
            voiceResponse.hangup();
            
            return { shouldEndCall: true, responseXml: voiceResponse.toString() };
        }
    } else {
        res.cookie("reminder_curr_count", 0);
    }
    return { shouldEndCall: false };
};

  
const handleCallTransfer = (userVoiceInput, aiAgentConfig, res) => {
    // Check if the user's voice input includes the keyword "transfer"
    if (userVoiceInput.toLowerCase().includes("transfer")) {
        const voiceResponse = new twiml.VoiceResponse();
        voiceResponse.say("Transferring your call, please hold.");

        // Retrieve the transfer number from the AI agent configuration
        const transferNumber = aiAgentConfig.transfer_call_number ?? "";

        // Dial the transfer number
        voiceResponse.dial(transferNumber);

        // Send the voice response as XML
        res.setHeader("Content-Type", "application/xml");
        res.send(voiceResponse.toString());

        // Indicate that the call transfer was handled
        return true;
    }

    // Indicate that no call transfer was requested
    return false;
};

async function createTwilioCallRecording(client, callId, host) {
    const callbackUrl = `https://ffff-2409-4055-2d05-1f25-4349-3f31-9ed0-7341.ngrok-free.app/api/twilio-recording-events`;
    const transcribeUrl = `https://ffff-2409-4055-2d05-1f25-4349-3f31-9ed0-7341.ngrok-free.app/api/twilio-transcribe`
    // console.log('callback urll',callbackUrl,transcribeUrl)

    try {

        const call = await client.calls(callId).fetch();
        if (call.status === 'in-progress') {
            const recording = await client
                .calls(callId)
                .recordings.create({
                    recordingChannels: "dual",
                    recordingStatusCallback: callbackUrl,
                    recordingStatusCallbackEvent: ["completed"],
                    transcribe: true,
                    transcribeCallback: transcribeUrl,
                });
            console.log('Recording started:', recording.sid);
            return recording
        }
        else {
            console.error('Call is not active. Cannot start recording.');
        }
    }
    catch(err) {
        console.error('Error starting recording:', err);
    }

}

// Check for voice AI API functionality
async function checkVoiceAICredits(userId) {
    try {
        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check voice AI credits
        if (user.voice_ai_credits > 0) {
            // Functionality runs normally
            return { success: true, message: "Voice AI functionality is available." };
        } else {
            // Check if credit card exists
            const creditCard = await CreditCard.findOne({ user_id: userId });
            if (!creditCard) {
                return { success: false, message: "Please add a credit card to continue." };
            } else {
                // Functionality works normally with credit card
                return { success: true, message: "Voice AI functionality is available with credit card." };
            }
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "An error occurred while checking credits." };
    }
}

// Check for Buy Number API functionality
async function checkBuyNumberAPI(userId) {
    try {
        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if credit card exists
        const creditCard = await CreditCard.findOne({ user_id: userId });
        if (!creditCard) {
            return { success: false, message: "Please add a credit card to buy a number." };
        }

        // Proceed with Buy Number API functionality
        return { success: true, message: "Proceeding with Buy Number API functionality." };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An error occurred while checking Buy Number API." };
    }
}

async function getPlivoNumbers() {
    const plivoNumbers = await PlivoPhoneRecord.find();
    console.log(plivoNumbers,'check for plivo numbers here gpt ')
    return plivoNumbers.map((num) => num.phone_number); // Sirf number array me return karega
  }

module.exports = {
    createCallHistory,
    createCallSessionLogs,
    getVoiceEngine,
    getVoiceRespUrl,
    handleReminders,
    handleCallTransfer,
    generateSystemPrompt,
    createTwilioCallRecording,
    checkVoiceAICredits,
    checkBuyNumberAPI,
    getDefaultCreditCard ,
    getPlivoNumbers
}

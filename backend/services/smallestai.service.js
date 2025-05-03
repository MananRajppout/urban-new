const dotenv = require('dotenv');
const { createWriteStream, unlinkSync, writeFileSync } = require('fs');
const { v4: uuid } = require('uuid');
const { uploadToCLoudinary } = require('./cloudinary.service');
dotenv.config();


const SMALLEST_AI_API_KEY = process.env.SMALLEST_AI_API_KEY;

const generatePrereordedAudioSmallestAI = async (config) => {
    const { text, voice_id, voice_speed } = config;
    return new Promise(async (resolve, reject) => {
        try {
            const options = {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + SMALLEST_AI_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: voice_id,
                    add_wav_header: false,
                    sample_rate: 16000,
                    speed: voice_speed,
                    language: "en",
                }),
            };


            const response = await fetch(
                "https://waves-api.smallest.ai/api/v1/lightning/get_speech",
                options
            );
            const audioBuffer = await response.arrayBuffer();
            const pcmBase64 = Buffer.from(audioBuffer).toString("base64");


            const text_file = `${uuid()}.txt`;
            writeFileSync(text_file, pcmBase64);
            const result = await uploadToCLoudinary(text_file);
            unlinkSync(text_file);


            resolve({
                public_url: result.url,
                publid_id: result.id
            });
        } catch (error) {
            reject(error);
        }
    });
};




module.exports = {
    generatePrereordedAudioSmallestAI,
};

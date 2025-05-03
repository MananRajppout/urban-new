const dotenv = require('dotenv');
const { createWriteStream, unlinkSync, writeFileSync } = require('fs');
const { v4: uuid } = require('uuid');
const { uploadToCLoudinary } = require('./cloudinary.service');
const wav = require('wavefile')
dotenv.config();


const SARVAM_API_KEY = process.env.SARVAM_API_KEY;




const generatePrereordedAudioSarvamAI = async (config) => {
    const { text, voice_id } = config;
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch("https://api.sarvam.ai/text-to-speech", {
                method: "POST",
                headers: {
                    "api-subscription-key": SARVAM_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: [text],
                    target_language_code: "hi-IN",
                    speaker: voice_id,
                    pitch: 0,
                    pace: 1.2,
                    loudness: 1,
                    speech_sample_rate: 16000,
                    enable_preprocessing: true,
                    model: "bulbul:v1",
                }),
            });

            const data = await response.json();
            const base64 = data?.audios[0];
            const wavBuffer = Buffer.from(base64, "base64");
            const wavFile = new wav.WaveFile(new Uint8Array(wavBuffer));
            const pcmSamples = wavFile.data.samples;
            const pcmBase64 = Buffer.from(pcmSamples).toString("base64");


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
    generatePrereordedAudioSarvamAI,
};

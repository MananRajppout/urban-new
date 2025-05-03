const dotenv = require('dotenv');
const { ElevenLabsClient } = require('elevenlabs');
const { createWriteStream, unlinkSync, writeFileSync } = require('fs');
const { v4: uuid } = require('uuid');
const { uploadToCLoudinary } = require('./cloudinary.service');

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

const generatePrereordedAudio = async (config) => {
  const { text, voice_id, use_speaker_boost, similarity_boost, stability, speed } = config;
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.textToSpeech.convert('FFmp1h1BMl0iVHA0JxrI', {
        model_id: 'eleven_flash_v2_5',
        text,
        output_format: 'pcm_16000',
        // Optionally include these if you want voice tuning:
        // voice_settings: {
        //   stability,
        //   similarity_boost,
        //   use_speaker_boost,
        //   speed,
        // },
      });

      const fileName = `${uuid()}.txt`;
      const text_file = `${uuid()}.txt`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);

      const audioBuffer = [];
      audio.on('data', (chunk) => {
        audioBuffer.push(chunk);
      });

      audio.on('end', async () => {
        const audioBufferCombined = Buffer.concat(audioBuffer);
        const base64Audio = audioBufferCombined.toString('base64');

        writeFileSync(text_file, base64Audio);
        const result = await uploadToCLoudinary(text_file);

        unlinkSync(fileName);
        unlinkSync(text_file);

        resolve({
          public_url: result.url,
          publid_id: result.id
        });
      });

      fileStream.on('finish', () => console.log("✅ Audio file stream finished"));
      fileStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};




module.exports = {
  generatePrereordedAudio,
};

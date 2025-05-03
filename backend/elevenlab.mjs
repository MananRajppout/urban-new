import dotenv from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream,unlinkSync,writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';

const ELEVENLABS_API_KEY = "sk_ae23da31ca5c91914458a9561b53c0c2c283eeb886a28ecc";

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.textToSpeech.convert('FFmp1h1BMl0iVHA0JxrI', {
        model_id: 'eleven_flash_v2_5',
        text,
        output_format: 'pcm_16000',
        // Optional voice settings that allow you to customize the output
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
          use_speaker_boost: true,
          speed: 1.0,
        },
      });
      console.log("A")
      const fileName = `${uuid()}.txt`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      const audioBuffer = [];
      audio.on('data', (chunk) => {
        audioBuffer.push(chunk);
      });
      audio.on('end',() => {
        const audioBufferCombined = Buffer.concat(audioBuffer);
        const base64Audio = audioBufferCombined.toString('base64');
        writeFileSync('base64.txt',base64Audio)
        unlinkSync(fileName)
        
      })
      fileStream.on('finish', () => resolve(fileName)); // Resolve with the fileName
      fileStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

createAudioFileFromText("Good day! Welcome to Urban Four-Star Hotels. My name is Emma. How can I assist you with your booking today?")

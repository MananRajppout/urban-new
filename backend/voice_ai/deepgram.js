const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AWSHelper = require('../utils/aws_helper');
// const { createClient } = require('@deepgram/sdk');

class DeepGramVoiceHelper {
    constructor() {
        this.apiKey = process.env.DEEPGRAM_API_KEY;
        this.apiUrl = `https://api.deepgram.com/v1`;
        this.awsHelper = new AWSHelper();
        // this.deepgramClient = createClient(this.apiKey);
        this.cdnUrl = process.env.VOICE_AI_BUCKET_CDN_URL;
        this.BUCKET_NAME = process.env.VOICE_AI_BUCKET_NAME;
		// this.FILE_HOST = `https://backend.urbanchat.ai/api/`
        this.FILE_HOST = process.env.FILE_HOST
        this.FILE_DIR = process.env.DOCKER_EBS_PATH;
    }
    fetchWithTimeout = (url, options, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, timeout);

            fetch(url, options)
                .then(response => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .catch(err => {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    };

    async _getTextToSpeechFile(text, uniqueFileName, voice_model_id = 'aura-asteria-en', language_code = 'en-US') {

        const filePath = path.join(this.FILE_DIR, uniqueFileName);
        const url = `${this.apiUrl}/speak?model=${voice_model_id}`

        const payload = {
            text: text,
        };

        const config = {
            headers: {
                Authorization: `Token ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            responseType: "stream", // Ensure the response is treated as a stream
        };

        try {
            const response = await axios.post(url, payload, config);
    
            if (response.status !== 200) {
                console.error(`HTTP error! Status: ${response.status}`);
                return;
            }
    
            const dest = fs.createWriteStream(filePath);
            response.data.pipe(dest);
    
            // Return a promise that resolves when the stream finishes
            await new Promise((resolve, reject) => {
                dest.on('finish', () => {
                    console.log('File saved successfully.');
                    resolve();
                });
                dest.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (error) {
            console.error('Deepgram error:', error.message);
            throw error;
        }
            
        return filePath
    }

    async createMp3File(text, voice_model_id, uniqueFileName, language_code) {

        try { 
            return this._getTextToSpeechFile(text, uniqueFileName, voice_model_id, language_code )
        }
        catch(err) {
            console.error("Error while generating MP3 file: ", err);
            throw err;
        }
    }

    async getCdnAudioUrl(s3Key) {
        // return `${this.cdnUrl}${s3Key}`;
        return `${this.FILE_HOST}?file_name=${s3Key}`
    }

    async fetchVoices() {
        return [
            {
                "name": "Asteria",
                "accent": "American",
                "gender": "Female",
                "voice_id": "aura-asteria-en",
                "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565353/aura/asteria_docs_venw0r.wav",
                "age" : "middle aged"
            },
            // {
            //     "name": "Thalia",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-2-thalia-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565353/aura/asteria_docs_venw0r.wav",
            //     "age" : "middle aged"
            // },
            {
                "name": "asteria",
                "accent": "American",
                "gender": "Female",
                "voice_id": "aura-2-asteria-en",
                "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565353/aura/asteria_docs_venw0r.wav",
                "age" : "middle aged"
            },
            // {
            //     "name": "Asteria",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-asteria-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565353/aura/asteria_docs_venw0r.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Luna",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-luna-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565351/aura/luna_docs_clom0e.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Stella",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-stella-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565349/aura/stella_docs_xh5jbv.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Athena",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-athena-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565613/aura/athena_docs_wyznud.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Hera",
            //     "accent": "American",
            //     "gender": "Female",
            //     "voice_id": "aura-hera-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565347/aura/hera_docs_xjkt4x.wav",
            //     "age" : "old"
            // },
            // {
            //     "name": "Orion",
            //     "accent": "American",
            //     "gender": "Male",
            //     "voice_id": "aura-orion-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565346/aura/orion_docs_aljv1q.mp3",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Arcas",
            //     "accent": "American",
            //     "gender": "Male",
            //     "voice_id": "aura-arcas-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565348/aura/arcas_docs_pc9hxp.mp3",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Perseus",
            //     "accent": "American",
            //     "gender": "Male",
            //     "voice_id": "aura-perseus-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565350/aura/perseus_docs_ap7fc0.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Angus",
            //     "accent": "Irish",
            //     "gender": "Male",
            //     "voice_id": "aura-angus-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565352/aura/angus_docs_lgse2b.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Orpheus",
            //     "accent": "American",
            //     "gender": "Male",
            //     "voice_id": "aura-orpheus-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565350/aura/orpheus_docs_zdlpcf.wav",
            //     "age" : "middle aged"
            // },
            // {
            //     "name": "Helios",
            //     "accent": "British",
            //     "gender": "Male",
            //     "voice_id": "aura-helios-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565346/aura/helios_docs_ycjwoo.wav",
            //     "age" : "young"
            // },
            // {
            //     "name": "Zeus",
            //     "accent": "American",
            //     "gender": "Male",
            //     "voice_id": "aura-zeus-en",
            //     "voice_url": "https://res.cloudinary.com/deepgram/video/upload/v1709565347/aura/zeus_docs_fupdiv.wav",
            //     "age" : "middle aged"
            // }
        ]
    }
}

module.exports = DeepGramVoiceHelper;
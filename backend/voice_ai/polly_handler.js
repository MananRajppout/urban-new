const { Polly } = require("aws-sdk");
const AWSHelper = require("../utils/aws_helper");

class PollyVoiceHelper {
    constructor() {
        this.polly = new Polly({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: "eu-west-3",
        });
        this.awsHelper = new AWSHelper();
    }

    // After creating mp3 store in s3 as well
    async createMp3File(text, polly_voice_id, unique_file_name){
        const payload = {
            Text: text,
            OutputFormat: "mp3",
            VoiceId: polly_voice_id, 
        };

        const pollyRequestPromise = new Promise((resolve, reject) => {
            this.polly.synthesizeSpeech(payload, (err, data) => {
              if (err) {
                console.log(err, err.stack);
                reject(err);
              } else {
                resolve(data);
              }
            });
          });
      
      
        // Await Polly synthesis and OpenAI completion
        const [pollyResponse] = await Promise.all([pollyRequestPromise]);

        if (!pollyResponse.AudioStream || pollyResponse.AudioStream.length === 0) {
            console.error("Polly did not return audio data, voice_id: ", polly_voice_id, pollyResponse);
            throw new Error("Polly did not return audio data");
          }

        // upload in s3 
        const s3Payload = {
            Bucket: process.env.VOICE_AI_BUCKET_NAME,
            Key: unique_file_name,
            Body: pollyResponse.AudioStream,
            ContentType: "audio/mpeg",
        };

        await this.awsHelper.s3.upload(s3Payload).promise();
        return true;
    }

    async getCdnAudioUrl(s3Key){
        return `${process.env.VOICE_AI_BUCKET_CDN_URL}${s3Key}`
    }
}

module.exports = PollyVoiceHelper;
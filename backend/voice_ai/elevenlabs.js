const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const AWSHelper = require("../utils/aws_helper");

class ElevenLabsVoiceHelper {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.apiUrl = "https://api.elevenlabs.io/v1";
    this.awsHelper = new AWSHelper();
    this.cdnUrl = process.env.VOICE_AI_BUCKET_CDN_URL;
    this.BUCKET_NAME = process.env.VOICE_AI_BUCKET_NAME;
    // this.FILE_HOST = `https://backend.urbanchat.ai/api/`
    this.FILE_HOST = process.env.FILE_HOST;
    this.FILE_DIR = process.env.DOCKER_EBS_PATH;
  }

  async _createDictionary(name, file, description) {
    const form = new FormData();
    form.append("name", name);
    form.append("file", file);
    form.append("description", description);
    form.append("workspace_access", "admin");

    const options = {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey,
        ...form.getHeaders(),
      },
      data: form,
    };

    try {
      const response = await axios.post(
        `${this.apiUrl}/pronunciation-dictionaries/add-from-file`,
        form,
        options
      );
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async _getPronunciationDict() {
    const options = {
      method: "GET",
      headers: { "xi-api-key": this.apiKey },
    };

    try {
      const response = await axios.get(
        `${this.apiUrl}/pronunciation-dictionaries/`,
        options
      );
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async _getTextToSpeechLocal(
    text = "",
    uniqueFileName,
    voice_id = "21m00Tcm4TlvDq8ikWAM",
    language = "en-US"
  ) {
    // Local is for to store data in EBS
    const filePath = path.join(this.FILE_DIR, uniqueFileName);

    const payload = {
      text: text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.1,
        similarity_boost: 0.1,
        use_speaker_boost: true,
      },
      pronunciation_dictionary_locators: [
        {
          pronunciation_dictionary_id: "QBb1LTBjfAXZZN40xzNP",
          version_id: "CzaR8OC0iccB9hppj72e",
        },
      ],
    };

    const options = {
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey,
      },
      data: JSON.stringify(payload),
      responseType: "stream",
    };

    try {
      const response = await axios(options);

      // Create a writable stream to save the file
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      // Await the promise that resolves when the file has been written
      await new Promise((resolve, reject) => {
        writer.on("finish", () => {
          console.log("File saved successfully.");
          resolve();
        });
        writer.on("error", (err) => {
          console.log("check ok", err);
          reject(err);
        });
      });
    } catch (err) {
      console.log("Elevenlabs _getTextToSpeechLocal error:", err);
      throw err;
    }
    return filePath;
  }

  // Private Functions
  async _getTextToSpeech(text = "", voice_id = "21m00Tcm4TlvDq8ikWAM") {
    const payload = {
      text: text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.1,
        similarity_boost: 0.1,
        use_speaker_boost: true,
      },
      pronunciation_dictionary_locators: [
        {
          pronunciation_dictionary_id: "QBb1LTBjfAXZZN40xzNP",
          version_id: "CzaR8OC0iccB9hppj72e",
        },
      ],
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey,
      },
      body: JSON.stringify(payload),
    };

    const fetchWithTimeout = (url, options, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error("Request timed out"));
        }, timeout);

        fetch(url, options)
          .then((response) => {
            clearTimeout(timer);
            resolve(response);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    try {
      const response = await fetchWithTimeout(
        `${this.apiUrl}/text-to-speech/${voice_id}`,
        options
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.arrayBuffer();
    } catch (err) {
      console.log("error in elevenlabs:", err);
      return null;
    }
  }

  async createMp3FileLocal(text, voiceId, uniqueFileName) {
    // Generate audio using Eleven Labs
    const audioBuffer = await this._getTextToSpeech(text, voiceId);

    if (!audioBuffer) {
      console.error("Eleven Labs did not return audio data");
      throw new Error("Eleven Labs did not return audio data");
    }

    // Save the audio buffer as an MP3 file
    const filePath = path.join(this.FILE_DIR, uniqueFileName);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));

    return true;
  }

  async createMp3File(text, voiceId, uniqueFileName, language_code = "en-US") {
    // This function is used to store mp3 in s3

    try {
      return this._getTextToSpeechLocal(
        text,
        uniqueFileName,
        voiceId,
        language_code
      );
    } catch (err) {
      console.error("Error while creating MP3 file :", err);
      throw err;
    }
    // return await this.createMp3FileLocal(text, voiceId, uniqueFileName) //without stream
    // Generate audio using Eleven Labs
    const audioBuffer = await this._getTextToSpeech(text);

    if (!audioBuffer) {
      console.error("Eleven Labs did not return audio data");
      throw new Error("Eleven Labs did not return audio data");
    }

    // Save the audio buffer as an MP3 file
    const filePath = path.join("/tmp", uniqueFileName);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    const fileStream = fs.createReadStream(filePath);

    console.log(this.BUCKET_NAME);
    const s3Payload = {
      Bucket: this.BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileStream,
      ContentType: "audio/mpeg",
    };

    try {
      await this.awsHelper.s3.upload(s3Payload).promise();
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to upload to S3", err);
      throw err;
    }

    return true;
  }

  async getCdnAudioUrl(s3Key) {
    return `${this.FILE_HOST}?file_name=${s3Key}`;
  }

  async fetchVoices(key) {
    const options = {
      method: "GET",
      headers: {
        "xi-api-key": key,
        // "xi-api-key": key || this.apiKey,
      },
    };
    try {
      const response = await axios.get(`${this.apiUrl}/voices`, options);

      // Transform the ElevenLabs response to match DeepGram's format
      const transformedVoices = response.data.voices.map((voice) => ({
        name: voice.name,
        accent: voice.labels.accent,
        gender: voice.labels.gender,
        voice_id: voice.voice_id,
        voice_url: voice.preview_url,
        age: voice.labels.age,
      }));
      return transformedVoices;
    } catch (error) {
      console.error("Error fetching voices:", error.message);
      return [];
    }
  }
}

module.exports = ElevenLabsVoiceHelper;

require("dotenv").config();
const { Buffer } = require("node:buffer");
const EventEmitter = require("events");
const fetch = require("node-fetch");

class TextToSpeechService extends EventEmitter {
  constructor() {
    super();
    this.nextExpectedIndex = 0;
    this.speechBuffer = {};
    this.voiceId = "aura-luna-en";
  }

  // Setup the Deepgram Voice ID
  setVoiceId(voiceId) {
    if (voiceId) this.voiceId = voiceId;
  }

  async generate(gptReply, interactionCount) {
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) {
      return;
    }

    try {
      // console.log("TTS Voice ID: ", this.voiceId);
      const response = await fetch(
        `https://api.deepgram.com/v1/speak?model=${this.voiceId}&encoding=mp3&bit_rate=32000`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: partialResponse,
          }),
        }
      );

      if (response.status === 200) {
        try {
          const blob = await response.blob();
          const audioArrayBuffer = await blob.arrayBuffer();
          const base64String = Buffer.from(audioArrayBuffer).toString("base64");
          this.emit(
            "speech",
            partialResponseIndex,
            base64String,
            partialResponse,
            interactionCount
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log("Deepgram TTS error:");
        console.log(response);
      }
    } catch (err) {
      console.error("Error occurred in TextToSpeech service");
      console.error(err);
    }
  }

  async generateWithFuncCall(gptReply, funcData, interactionCount) {
    const { partialResponseIndex, partialResponse } = gptReply;

    if (!partialResponse) {
      return;
    }

    try {
      // console.log("TTS Voice ID: ", this.voiceId);
      const response = await fetch(
        `https://api.deepgram.com/v1/speak?model=${this.voiceId}&encoding=mp3&bit_rate=32000`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: partialResponse,
          }),
        }
      );

      if (response.status === 200) {
        try {
          const blob = await response.blob();
          const audioArrayBuffer = await blob.arrayBuffer();
          const base64String = Buffer.from(audioArrayBuffer).toString("base64");
          this.emit(
            "funcspeech",
            partialResponseIndex,
            base64String,
            partialResponse,
            funcData,
            interactionCount
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log("Deepgram TTS error:");
        console.log(response);
      }
    } catch (err) {
      console.error("Error occurred in TextToSpeech service");
      console.error(err);
    }
  }
}

module.exports = { TextToSpeechService };

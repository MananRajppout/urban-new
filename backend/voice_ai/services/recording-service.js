require("dotenv").config();
const telnyx = require("telnyx")(process.env.TELNYX_API_KEY);
const { CallHistory } = require("../model");

async function recordingService(ttsService, callSid, enableRecording) {
  try {
    if (enableRecording) {
      // Generate TTS message (optional, adjust according to your needs)
      // Stopped Sending this message based on Customer Requirements
      // ttsService.generate({ partialResponseIndex: null, partialResponse: 'This call will be recorded.' }, 0);

      // Retrieve the call using the call_control_id
      const call = new telnyx.Call({ call_control_id: callSid });

      // Start recording the call
      const recording = await call.record_start({
        format: "mp3",
        channels: "single",
      });

      // const transcription = await call.transcription_start({language: "en"});
      const histObj = await CallHistory.findOne({ caller_id: callSid });
      histObj.recording_sid = recording.data.recording_id;
      await histObj.save();
      // console.log(transcription);
      console.log(`Recording Started: ${recording.data.recording_id}`.red); // Assuming recording_id is returned
    } else {
      console.log("Recording is not enabled for this call.");
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = { recordingService };

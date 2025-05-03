const catchAsyncError = require("../middleware/catchAsyncError");
const { twiml } = require("twilio");
exports.twilioRecord = catchAsyncError(async (req, res, next) => {

    // Configure the voice response to gather speech input.
	await req.body.response.record({
        playBeep:false,
        recordingStatusCallback: '/api/twilio-recording-events', // Replace with your endpoint to handle recording
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent : ['completed']
    });

	// Send the generated TwiML response back to Twilio.
	res.setHeader("Content-Type", "application/xml");
	res.send(req.body.response.toString());
    await createTwilioCallRecording(req.body.twilioClient, req.body.CallId, req.get('host'))
});
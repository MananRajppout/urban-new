const catchAsyncError = require("../../middleware/catchAsyncError");

exports.getVoiceBackgroundSounds = catchAsyncError(async (req, res) => {
  const settings = {
    backgroundSounds: [
      {
        id: "call_center",
        name: "Call Center",
      },
    ],
  };

  res.status(200).json({
    success: true,
    settings,
  });
});

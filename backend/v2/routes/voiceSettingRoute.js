const express = require("express");
const checkSessionExpiration = require("../../middleware/auth");
const { getVoiceBackgroundSounds } = require("../controller/voiceSetting");

const router = express.Router();

router.get(
    "/voice/settings/background-sounds",
    checkSessionExpiration(["customer"]),
    getVoiceBackgroundSounds
  );

module.exports = router;

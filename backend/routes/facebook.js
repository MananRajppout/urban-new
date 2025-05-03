const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const {verifyFacebookCallback, postFacebookCallback, fetchIntegrate, updateWhatsappIntegrate} = require("../integrates/controller");

const router = express.Router();

// APIs for whatsapp callback, one is GET and second POST for to send message 
router.route("/facebook/webhook").get(verifyFacebookCallback);
router.route("/facebook/webhook").post(postFacebookCallback);

router.route("/facebook/details").get(checkSessionExpiration(["customer"]), fetchIntegrate);
router.route("/facebook/details").post(checkSessionExpiration(["customer"]), updateWhatsappIntegrate);

module.exports = router;
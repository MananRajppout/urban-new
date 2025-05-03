const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { verifyWhatsappCallback, postWhatsappCallback, 
    updateWhatsappIntegrate, fetchIntegrate } = require("../integrates/controller");

const router = express.Router();

// APIs for whatsapp callback, one is GET and second POST for to send message 
router.route("/whatsapp/webhook").get(verifyWhatsappCallback);
router.route("/whatsapp/webhook").post(postWhatsappCallback);

// APIs for Users to fetch and update
router.route("/whatsapp/details").get(checkSessionExpiration(["customer"]), fetchIntegrate);
router.route("/whatsapp/details").post(checkSessionExpiration(["customer"]), updateWhatsappIntegrate);


module.exports = router;
const express = require("express");
const { pickupWebhook, hangupWebhook } = require("../controller/webcallController");
const router = express.Router();

// webhooks
router.post("/webcall/webhook/pickup",pickupWebhook);
router.post("/webcall/webhook/hangup",hangupWebhook);


module.exports = router;
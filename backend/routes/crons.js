const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { callHistoryEndTimeCron, callPriceCalCron, phPriceCalCron, renewChatCredits, voiceAICredit, dailyCallSummaries } = require("../crons/controller");


// Crons are just a notification to trigger some async process
const router = express.Router();

router.route("/cron/call-hist-sync").get(checkSessionExpiration(["bot"]),callHistoryEndTimeCron );
router.route("/cron/call-price-cal").get(checkSessionExpiration(["bot"]), callPriceCalCron);
router.route("/cron/ph-price-cal").get(checkSessionExpiration(["bot"]), phPriceCalCron);
router.route("/cron/renew-chat-credits").get(checkSessionExpiration(["bot"]), renewChatCredits);
router.route("/cron/voice-ai-credits").get(checkSessionExpiration(["bot"]), voiceAICredit);

module.exports = router;
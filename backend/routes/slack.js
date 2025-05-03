const express = require("express");
const { getSlackInstall, slackWebhookCall } = require("../integrates/controller");

const router = express.Router();

router.route("/slack/install").get(getSlackInstall);

router.route("/slack/oauthRedirect").get(slackWebhookCall)

module.exports = router;
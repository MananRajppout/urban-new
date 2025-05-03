const express = require("express");
const checkSessionExpiration = require("../../middleware/auth");
const {
  getAllNumbers,
  getNumber,
  buyNumber,
  deleteNumber,
  searchNumbers,
  updateAgentPhoneNumber,
  voiceWebhook,
  statusWebhook,
  recordWebhook,
  hangupWebhook,
  makeCall,
  deleteNumberPlivo,
} = require("../controller/plivoController");
const router = express.Router();

// callbacks from plivo
router.post("/phone/webhook/voice",voiceWebhook);
router.post("/phone/webhook/voice/hangup",hangupWebhook);
router.post("/phone/webhook/status",statusWebhook);
router.post("/phone/webhook/record",recordWebhook);

// route for outbound call
router.post(
  "/phone/call",
  makeCall
);

router.get(
  "/phone/numbers",
  checkSessionExpiration(["customer"]),
  getAllNumbers
);
router.get(
  "/phone/numbers/search",
  checkSessionExpiration(["customer"]),
  searchNumbers
);
router.post(
  "/phone/numbers/buy",
  checkSessionExpiration(["customer"]),
  buyNumber
);

// update agent phone number
router.put(
  "/phone/agent/phone-number",
  checkSessionExpiration(["customer"]),
  updateAgentPhoneNumber
);



router.get(
  "/phone/numbers/:id",
  checkSessionExpiration(["customer"]),
  getNumber
);

router.get(
  "/phone/numberdelete",
  checkSessionExpiration(["customer"]),
  deleteNumberPlivo
);

// get 







module.exports = router;

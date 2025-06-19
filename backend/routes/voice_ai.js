const express = require("express");
const {
  twilioCallRespond,
  createAIAgent,
  updateAIAgent,
  deleteAIAgent,
  fetchAIAgents,
  fetchSingleAiAgent,
  handleTwilioCallRequest,
  twiRecEvents,
  twiTranscribeEvents,
  fetchCallHistory,
  fetchVoices,
  deleteCallHistory,
  getVoiceAIDashboardStats,
  getCallActivityChart,
  getRecentCallsData,
  getChatbotDashboardStats,
  getMessageActivityChart,
  getPeakMessageTimesData,
  getUniqueVisitorsData,
  getRecentMessagesData,
  deleteAiAgent,
  getCallsBySource,
  generateLivekitToken,
  getSuperAdminDashboardData,
  getAllCustomers,
  getSuperAdminUserDashboardData,
  superAdminAssisgNumber,
  fetchSingleAiAgentForLivekit,
} = require("../voice_ai/controller");
const {
  handleTelnyxCallRequest,
  fetchCountryAndPhoneNumbersCosts,
  fetchPhoneNumbers,
  buyPhoneNumber,
  fetchSinglePhoneNumber,
  updatePhoneNumber,
  makeOutboundCall,
  deleteTelnyxPhoneNumber,
  fetchSingleCallHistory,
} = require("../voice_ai/controller_telnyx");
const checkSessionExpiration = require("../middleware/auth");
const router = express.Router();
const { generateWebCallAccessToken } = require("../voice_ai/controller_telnyx");
router.post("/telnyx-webhook", handleTelnyxCallRequest);

// GET : METHOD
router
  .route("/fetch-twilio-phonenumbers")
  .get(checkSessionExpiration(["customer"]), fetchPhoneNumbers);


router.route("/generate-livekit-token").post(generateLivekitToken);

router.route("/make-outbound-call").get(makeOutboundCall);
router
  .route("/fetch-all-voices")
  .get(checkSessionExpiration(["customer"]), fetchVoices);
router
  .route("/fetch-call-history")
  .get(checkSessionExpiration(["customer"]), fetchCallHistory);
  

// super admin 
router
  .route("/fetch-super-admin-dashboard-data")
  .get(checkSessionExpiration(["customer"]), getSuperAdminDashboardData);

router
  .route("/fetch-super-admin-user-dashboard-data")
  .get(checkSessionExpiration(["customer"]), getSuperAdminUserDashboardData);

router
  .route("/fetch-super-admin-user-assisgn-minutes")
  .post(checkSessionExpiration(["customer"]), superAdminAssisgNumber);

router
  .route("/fetch-all-customer")
  .get(checkSessionExpiration(["customer"]), getAllCustomers);




router
  .route("/fetch-call-history/:id")
  .get(checkSessionExpiration(["customer"]), fetchSingleCallHistory);

router.post("/twilio-call-handler", handleTwilioCallRequest);
router.delete("/delete-call/:callUuid", deleteCallHistory);
router.route("/respond").post(twilioCallRespond);
router
  .route("/telnyx/buy-phone-number")
  .post(checkSessionExpiration(["customer"]), buyPhoneNumber);
router
  .route("/twilio/fetch-phone-numbers")
  .post(checkSessionExpiration(["customer"]), fetchPhoneNumbers);
router
  .route("/twilio/fetch-phone-number/:ph_id")
  .post(checkSessionExpiration(["customer"]), fetchSinglePhoneNumber);
router
  .route("/twilio/update-phone-number/:phone_number_id")
  .put(checkSessionExpiration(["customer"]), updatePhoneNumber);
router
  .route("/create-ai-agent")
  .post(checkSessionExpiration(["customer"]), createAIAgent);
router
  .route("/fetch-ai-agents")
  .post(checkSessionExpiration(["customer"]), fetchAIAgents);
router
  .route("/fetch-ai-agent/:agent_id")
  .post(checkSessionExpiration(["customer"]), fetchSingleAiAgent)
  .get(fetchSingleAiAgentForLivekit);
router
  .route("/update-ai-agent/:agent_id")
  .post(checkSessionExpiration(["customer"]), updateAIAgent);
router.route("/twilio-recording-events").post(twiRecEvents);
router.route("/twilio-transcribe").post(twiTranscribeEvents);

router
  .route("/delete-twilio-number/:tw_ph_id")
  .delete(checkSessionExpiration(["customer"]), deleteTelnyxPhoneNumber);

router.route("/web-call/generate-access-token").get(generateWebCallAccessToken);
router
  .route("/telnyx/fetch-countries-and-costs")
  .get(fetchCountryAndPhoneNumbersCosts);

router
  .route("/dashboard-stats")
  .get(checkSessionExpiration(["customer"]), getVoiceAIDashboardStats);

router
  .route("/call-activity-chart")
  .get(checkSessionExpiration(["customer"]), getCallActivityChart);

router
  .route("/recent-calls")
  .get(checkSessionExpiration(["customer"]), getRecentCallsData);

// Chatbot Dashboard Stats
router
  .route("/chatbot-dashboard-stats")
  .get(checkSessionExpiration(["customer"]), getChatbotDashboardStats);

router
  .route("/message-activity-chart")
  .get(checkSessionExpiration(["customer"]), getMessageActivityChart);

router
  .route("/peak-message-times")
  .get(checkSessionExpiration(["customer"]), getPeakMessageTimesData);

router
  .route("/unique-visitors")
  .get(checkSessionExpiration(["customer"]), getUniqueVisitorsData);

router
  .route("/recent-messages")
  .get(checkSessionExpiration(["customer"]), getRecentMessagesData);

router
  .route("/delete-ai-agent/:id")
  .delete(checkSessionExpiration(["customer", "admin"]), deleteAiAgent);

router
  .route("/calls-by-source")
  .get(checkSessionExpiration(["customer"]), getCallsBySource);

module.exports = router;

const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { createChatbot, editChatbot, chatCompletion, createChatSource, scarperWithCrawler,
    editChatbotSource, fetchChatbotSourcesDetails, myChatbots, deleteChatSource, deleteChatbot,
    createLead, fetchLeads, fetchChatHistory, fetchMyChatbot, verifyLink, getChatbotWithShopify, youtubeTranscript, triggerChatbotTraining,
    deleteAllChatSources,
    createChatHistoryPdf } = require("../chatbot/controller");

const rolePermit = require("../middleware/role_auth")

const router = express.Router();

// METHOD : GET
router.route("/fetch-chatbot-sources").get(checkSessionExpiration(["customer"]), fetchChatbotSourcesDetails)
router.route("/my-chatbots").get(checkSessionExpiration(["customer"]), myChatbots)
router.route("/fetch-leads").get(checkSessionExpiration(["customer"]), fetchLeads);
router.route("/fetch-chatbot-history").get(checkSessionExpiration(["customer"]), fetchChatHistory);
router.route("/fetch-chatbot").get(fetchMyChatbot); // public api to fetch my-chatbot
router.route("/fetch-chatbot-with-shopify").get(getChatbotWithShopify);
router.route("/export-chat-history").get(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:export' }), createChatHistoryPdf)


// METHOD : POST
router.route("/create-chatbot").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), createChatbot);
router.route("/edit-chatbot").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), editChatbot);
router.route("/chat-completion").post(chatCompletion);
router.route("/chatbot-training").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), triggerChatbotTraining);

router.route("/youtube-transcript").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), youtubeTranscript);
router.route("/chat-source-create").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), createChatSource);
router.route("/crawler").post(checkSessionExpiration(["customer"]), scarperWithCrawler);
router.route("/create-lead").post(createLead);
router.route("/verify-link").post(checkSessionExpiration(["customer"]), verifyLink);
// Only for to change the text and Q/A
router.route("/edit-chatbot-source").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:write' }), editChatbotSource);


router.route("/delete-chatbot-sources").post(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:delete' }), deleteChatSource);
router.route("/delete-all-chatbot-sources/:chatbot_id").delete(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:delete' }), deleteAllChatSources);

// METHPD: DELETE
router.route("/delete-chatbot").delete(checkSessionExpiration(["customer"]), rolePermit({ permit_access: 'chatbot:delete' }), deleteChatbot);


module.exports = router;
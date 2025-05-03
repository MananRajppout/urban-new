const express = require("express");
// const checkSessionExpiration = require("../middleware/auth");
const {fetchCalendlyProfile, fetchEventTypes,fetchAvailableSlots,bookMeeting, fetchUserAppointments} = require("../calendly/controller");

const router = express.Router();

router.route("/calendly/fetch-profile/:user_name").get(fetchCalendlyProfile); 
router.route("/calendly/event-types/:user_name").get(fetchEventTypes); 
router.route("/calendly/available-slots/:event_type_uuid").get(fetchAvailableSlots); 
router.route("/calendly/book-meeting").post(bookMeeting); 
router.route("/calendly/fetch-user-appointments/:chatbot_id").get(fetchUserAppointments); 
// router.route("/facebook/webhook").post(postFacebookCallback);

// router.route("/facebook/details").get(checkSessionExpiration(["customer"]), fetchIntegrate);
// router.route("/facebook/details").post(checkSessionExpiration(["customer"]), updateWhatsappIntegrate);

module.exports = router;
const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { editPriceModel, fetchPriceModels, createStripeSession, 
    stripeSuccessCallback, stripeFailedCallback, stripeWebhook,
    addPaymentMethods,
    getPaymentMethods,
    makeDefaultCard,
    getVoiceBilling,
    deletePaymentMethod,
    fetchAIPriceModels,
    downloadInvoice,currentPlan,
    checkSubscriptionDue,
    getPaymentHistory,
    editPaymentMethods,
    createRazorpaySession,
    razorpaySuccessCallback
  } = require("../pricing/controller");

const router = express.Router();

// METHOD : GET
router.route("/fetch-price-models").get(fetchPriceModels);
router.route("/fetch-voice-ai-price-models").get(fetchAIPriceModels);
router.route("/fetch-payment-methods").get(checkSessionExpiration(["customer"]), getPaymentMethods);
router.route('/fetch-voice-billing').get(checkSessionExpiration(["customer"]), getVoiceBilling)

router.route("/stripe-success-callback").get(stripeSuccessCallback);
router.route("/stripe-failure-callback").get(stripeFailedCallback);

// METHOD : POST
router.route("/edit-price-model").post(checkSessionExpiration(["admin"]), editPriceModel);
router.route("/create-payment-session").post(checkSessionExpiration(["customer"]), createStripeSession);
router.route("/add-payment-methods").post(checkSessionExpiration(["customer"]), addPaymentMethods);
// router.post("/webhook",express.raw({type: 'application/json'}),stripeWebhook);

router.route("/create-razorpay-session").post(checkSessionExpiration(["customer"]), createRazorpaySession);
router.route("/razorpay-success-callback").post(checkSessionExpiration(["customer"]), razorpaySuccessCallback);

router.route("/make-default-card").post(checkSessionExpiration(["customer"]), makeDefaultCard)
router.route("/delete-payment-method").delete(checkSessionExpiration(["customer"]), deletePaymentMethod)

//download invoice here
router.route("/download-invoice").get(checkSessionExpiration(["customer"]), downloadInvoice);
router.route("/current-plan").get(checkSessionExpiration(["customer"]), currentPlan);
router.route("/check-due-payment").get(checkSessionExpiration(["customer"]),checkSubscriptionDue)

//billing get payment history

router.get(
    "/payment/history",
    checkSessionExpiration(["customer"]),
    getPaymentHistory
  );


router.route("/edit-payment-methods").put(checkSessionExpiration(["customer"]), editPaymentMethods);


module.exports = router;
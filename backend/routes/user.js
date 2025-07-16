const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { createUser, login, editUser, getUserDetails, verifyUserHash, getUserCount, deleteAccount, fetchRestriction,
    forgetPassword, resetPassword, emailSubscribe, chatbotContext,
    fetchWebsiteNotification,
    seenWebsiteNotification,
    checkSlugAvaible,
    getSettings,
    updateSettings,
    getWebsiteNameAndLogo,
    updateWebsiteNameAndLogo,
    requestNumber
} = require("../user/controller");
const { googleCallback } = require("../user/oauth_google");
const { facebookCallback } = require("../user/oauth_facebook");
const { appleLogin, handleIosGoogleLogin } = require("../user/ouath_apple");



const passport = require('passport');
const axios =require('axios')

const router = express.Router();

// Note : Temporary api, delete it in production
router.route("/admin-fetch-user-count").get(getUserCount);

// METHOD : GET
router.route("/verify-user").get(verifyUserHash);
router.route("/fetch-user-details").get(checkSessionExpiration(["customer"]), getUserDetails);
router.route("/request-number").get(checkSessionExpiration(["customer"]), requestNumber);
router.route("/fetch-restriction").get(checkSessionExpiration(["customer"]), fetchRestriction);
router.route("/email-subscribe").get(emailSubscribe);
router.route("/user-context").get(chatbotContext);
router.route("/fetch-website-notification").get(checkSessionExpiration(["customer"]), fetchWebsiteNotification)




// METHOD : POST
router.route("/register-user").post(createUser);
router.route("/check-slug-avaible").post(checkSlugAvaible);
router.route("/login").post(login);
router.route("/edit-user").post(checkSessionExpiration(["customer"]), editUser);
router.route("/delete-user").post(checkSessionExpiration(["customer", "admin"]), deleteAccount);

router.route("/forget-profile").post(forgetPassword);
router.route("/reset-password").post(checkSessionExpiration(["customer", "admin"]), resetPassword);
router.route("/seen-website-notification").post(checkSessionExpiration(["customer"]), seenWebsiteNotification)
router.route("/get-settings").get(checkSessionExpiration(["customer"]), getSettings);
router.route("/update-settings").post(checkSessionExpiration(["customer"]), updateSettings);
router.route("/get-website-name-and-logo").get(getWebsiteNameAndLogo);
router.route("/update-website-name-and-logo").post(checkSessionExpiration(["customer"]), updateWebsiteNameAndLogo);





/* Facebook Oauth */
router.route('/auth/facebook').get(passport.authenticate('facebook', { scope: ['email', 'profile']} )); //'public_profile'
router.route('/auth/facebook/callback').get(facebookCallback); // Handle authentication callback

/* Google Oauth */


router.get("/auth/google", (req, res, next) => {
    console.log("Redirecting to Google...");
    next();
  }, passport.authenticate("google", { scope: ["profile", "email"] }));
router.route("/auth/google/callback").get(passport.authenticate('google', { failureRedirect: "/api/health" }), googleCallback);

/* Apple Oauth */
router.route("/apple-login").post(appleLogin);



//here handle ios google login or signup
router.route("/auth/google-ios-login").post(handleIosGoogleLogin)





module.exports = router;

const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { userDetails, dashboard,accessUserAnalytics } = require('../admin/controller');

const router = express.Router();

// For to delete the existing integrate
router.route("/dashboard").get(checkSessionExpiration(["admin"]), dashboard);
router.route("/user-details").get(checkSessionExpiration(["admin"]), userDetails);


// router.route("/access-comprehensive-user-insights-and-analytics").get(accessUserAnalytics); 

module.exports = router;

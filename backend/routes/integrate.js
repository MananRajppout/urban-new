const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { deleteIntegrate } = require('../integrates/controller');

const router = express.Router();

// For to delete the existing integrate
router.route("/delete-integrate").post(checkSessionExpiration(["customer"]), deleteIntegrate);


module.exports = router;
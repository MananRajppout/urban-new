const express = require("express");
const checkSessionExpiration = require("../middleware/auth");
const { createInvite, createCaseReport, fileServe } = require("../support/controller")

const router = express.Router();

router.route("/create-invite").post(checkSessionExpiration(["customer"]), createInvite);
router.route("/create-case-report").post(checkSessionExpiration(["customer"]), createCaseReport);
router.route("/file-serve").get(fileServe);

module.exports = router;
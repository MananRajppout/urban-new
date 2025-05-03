const express = require("express");
const {
  sessionsVsTime,
  counts,
  chatsVsTime,
  chartData,
} = require("../stats/controller");
const checkSessionExpiration = require("../middleware/auth");
const router = express.Router();

router
  .route("/stats/chart-data")
  .get(checkSessionExpiration(["customer"]), chartData);

// DEPRECATED api
router.route("/stats/counts").get(checkSessionExpiration(["customer"]), counts);
router
  .route("/stats/sessions-vs-time")
  .get(checkSessionExpiration(["customer"]), sessionsVsTime);
router
  .route("/stats/chats-vs-time")
  .get(checkSessionExpiration(["customer"]), chatsVsTime);

module.exports = router;

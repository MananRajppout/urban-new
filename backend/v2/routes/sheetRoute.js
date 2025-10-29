const express = require("express");
const checkSessionExpiration = require("../../middleware/auth");
const {
  configureSheet,
  startCalls,
  stopCalls,
  getSheetStatus,
  resetSheet,
  getSheetConfig,
  getSheetHeader,
  scheduleCalls,
  cancelScheduledCalls,
  getScheduledCallByAgentId
} = require("../controller/sheetController");

const router = express.Router();

// Sheet configuration routes
router.post("/sheet/configure", checkSessionExpiration(["customer"]), configureSheet);
router.get("/sheet/config", checkSessionExpiration(["customer"]), getSheetConfig);
router.get("/sheet/status", checkSessionExpiration(["customer"]), getSheetStatus);
router.post("/sheet/start", checkSessionExpiration(["customer"]), startCalls);
router.post("/sheet/stop", checkSessionExpiration(["customer"]), stopCalls);
router.post("/sheet/reset", checkSessionExpiration(["customer"]), resetSheet);
router.post("/sheet/header", checkSessionExpiration(["customer"]), getSheetHeader);
router.post("/sheet/schedule", checkSessionExpiration(["customer"]), scheduleCalls);
router.post("/sheet/cancel", checkSessionExpiration(["customer"]), cancelScheduledCalls);
router.get("/sheet/scheduled", checkSessionExpiration(["customer"]), getScheduledCallByAgentId);
module.exports = router; 
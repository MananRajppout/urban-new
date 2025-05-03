/*
-> 1. Renew message credits 
-> 2. Check Paid plan status for every_users, is it working or not, if it's not then just simply convert the user's plan to free 

*/

const catchAsyncError = require("../middleware/catchAsyncError");
const { callHistoryEndTimeSync, callPriceCal, phPriceCal } = require("../pricing/voice_ai_cost_cal");
const { renew_chat_credits } = require("./chatbot");
const { voiceAICreditSync } = require("../pricing/voice_ai_cost_cal");

// each hour
exports.callHistoryEndTimeCron = catchAsyncError(async (req, res, next) => {
    callHistoryEndTimeSync();
});

//each hour
exports.callPriceCalCron = catchAsyncError(async (req, res, next) => {
    callPriceCal();
});

//each day
exports.phPriceCalCron = catchAsyncError(async (req, res, next) => {
    phPriceCal();
    applyCostToUser();
});

// renew chatbot credits
exports.renewChatCredits = catchAsyncError(async (req, res, next) => {
    res.status(200).json({ status: true, message: "Cron in the process" });
    await renew_chat_credits();
});

// Charge Voice AI credits
exports.voiceAICredit = catchAsyncError(async (req, res, next) => {
    res.status(200).json({ status: true, message: "Cron in the process" });
    await voiceAICreditSync();
});
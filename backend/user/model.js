const mongoose = require("mongoose");
const dynamoose = require("dynamoose");

const userSchema = new mongoose.Schema({
  full_name: { type: String, default: "" },
  email: { type: String, required: true },
  country_code: { type: String, required: false, default: "" },
  phone_number: { type: Number, required: false, default: 0 },
  password: { type: String, required: false, select: false },
  user_type: { type: String, default: "customer" },
  profile_image: { type: String, default: "" },
  created_time: { type: Date, default: Date.now },
  last_mod_time: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: false },
  pricing_plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PricePlan",
    required: false, // Set as not required
  },
  customer_payment_id: { type: String, default: "", required: false }, // stripe_ customer_payment_id
  pricing_plan_active: { type: Boolean, default: true },
  pricing_plan_applied: { type: Date, default: Date.now },
  voice_ai_credits: { type: Number, default: 1.5 },
  ai_price_plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VoiceAIPricePlan",
    required: false, // Set as not required
  },
  ai_pricing_plan_applied: { type: Date, default: Date.now },
  // user management fields
  role_id: { type: Number, required: false, default: 1 },
  org_id: { type: String, required: false },
  voice_ai_status: {
    type: String,
    default: "inactive",
    enum: ["active", "inactive", "free_trial"],
  },
  elevenlabs_api_key: {
    type: String,
    required: false,
    default: "",
  },
  rime_api_key: {
    type: String,
    required: false,
    default: "",
  },

  subscriptions: [
    {
      planType: { type: String, required: true },
      planId: { type: String, required: true },
      subscriptionId: { type: String, required: true },
      startDate: { type: Date, default: Date.now },
      current_period_end: { type: Date, required: true },
      unique_id: { type: String, required: true },
    },
  ],

  role: {
    type: String,
    default: "user",
    enum: ["user","admin","super-admin"]
  },

  custom_domain: {
    type: String,
    default: undefined,
    unique: true,
    sparse: true
  },

  slug_name: {
    type: String,
    default: undefined,
    unique: true
  },

  tenant: {
    type: String,
    default: "main",
    ref: "User"
  },

  daily_summary: {
    type: Boolean,
    default: false
  },

  call_summary: {
    type: Boolean,
    default: false
  },

  summary_email: {
    type: String,
    default: ""
  },

  logo: {
    type: String,
    default: undefined
  },

  website_name: {
    type: String,
    default: undefined
  },

  contact_email: {
    type: String,
    default: undefined
  },
  meta_description: {
    type: String,
    default: undefined
  },
  live_demo_agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiAgent",
    default: undefined
  },
  live_demo_phone_number: {
    type: String,
    required: false,
    default: ""
  },
  policy_text: {
    type: String,
    default: undefined
  }
  
});

const verificationTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" },
});

const verificationOtpSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1m" },
});

// DynamoDB Tables
// const restrictionSchema = new dynamoose.Schema({
//     id: String, // Primary key
//     user_id: String,

//     consumed_messages_user: Number,
//     quota_messages_user: Number,
//     price_plan_id: String
// });

const restrictionSchema = new mongoose.Schema({
  id: String, // Primary key
  user_id: String,

  consumed_messages_user: { type: Number, default: 0 },
  quota_messages_user: { type: Number, default: 0 },
  price_plan_id: String,
  ai_price_plan_id: String,
  chat_credit_updated_on: { type: Date },
  //   voice ai
  voice_trial_minutes_used: { type: Number, default: 0 },
  voice_trial_minutes_limit: { type: Number, default: 10 },
});
const emailNofificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, required: false, default: "all", enum: ["all"] },
  active: { type: Boolean, required: false, default: true },
  created_time: { type: Date, default: Date.now },
});

const websiteNotificationSchema = new mongoose.Schema({
  user_id: { type: String, require: true },
  log_message: { type: String, required: true },
  log_type: { type: String, require: false, default: "info" },
  created_time: { type: Date, default: Date.now, expires: "24h" },
});

module.exports = {
  User: mongoose.model("User", userSchema),
  VerificationToken: mongoose.model(
    "VerificationToken",
    verificationTokenSchema
  ),
  VerificationOtp: mongoose.model("VerificationOtp", verificationOtpSchema),
  EmailNotification: mongoose.model(
    "EmailNotification",
    emailNofificationSchema
  ),

  // Restriction : dynamoose.model('Restriction', restrictionSchema)
  Restriction: mongoose.model("Restriction", restrictionSchema),
  WebsiteNotification: mongoose.model(
    "WebsiteNotification",
    websiteNotificationSchema
  ),
};

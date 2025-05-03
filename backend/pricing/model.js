const { type } = require("dynamoose");
const mongoose = require("mongoose");

// Chatbot Pricing Plan
const pricePlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    period: { type: String, required: true, enum: ['year', 'month'] },
    cost: { type: Number, required: true }, // In terms of Euro
    allowed_characters: { type: Number, required: true },
    facebook_allowed: { type: Boolean, default: false },
    whatsapp_allowed: { type: Boolean, default: false },
    shopify_allowed: { type: Boolean, default: true },
    wordpress_allowed: { type: Boolean, default: true },
    manual_code_embed: { type: Boolean, default: false },
    support_team: { type: Boolean, default: false },
    document_upload: { type: Boolean, default: true },
    remove_powered_by: { type: Boolean, default: false },
    number_of_chatbots: { type: Number, required: true },

    messages_quota_user: { type: Number, default: 30 },
    features: { type: [String], required: false },

    // metadata
    soft_delete: { type: Boolean, default: false },
    created_time: { type: Date, default: Date.now },
    last_mod_time: { type: Date, default: Date.now }
});

// Voice AI Plan
// Voice AI Plan
const voiceAIPlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    static_db_name: { type: String, required: true, unique: true },
    cost: { type: Number, required: true }, // In terms of USD
    currency: { type: String, required: false, default: "usd" },
    concurrent_calls: { type: Number, required: false, default: 10 },
    total_minutes_balance: { type: Number, required: true, default: 10 },
    custom_voices: { type: Number, required: false, default: 5 },

    // LLM Pricing
    llm_cost_per_min: { type: Object, default: { 'gpt-3.5-turbo': 0.02, 'gpt-4o': 0.20 } }, // as per usd
    retell_twilio_cost_per_min: { type: Number, required: false, default: 0.01 },

    // Conversastion Pricing
    voice_engine_cost_per_min: { type: Object, default: { 'open-ai': 0.08 } }, //usd

    // metadata
    soft_delete: { type: Boolean, default: false },
    created_time: { type: Date, default: Date.now },
    last_mod_time: { type: Date, default: Date.now },

    benefits: {
        type: [String],  // Array of strings
        required: false
    },
});



// Voice AI Plan
const creditCardSchema = new mongoose.Schema({
    name: { type: String, required: false, default: "" },
    last4_card_number: { type: String, required: true, default: "" },
    expiry_month: { type: Number, required: true, default: 1 },
    expiry_year: { type: Number, required: true, default: 1 },
    // cvc: { type: Number, required:true, default: 1},

    user_id: { type: String, required: true, },
    payment_method_id: { type: String, required: true, default: "" },
    customer_id: { type: String, required: true, default: "" },
    is_default: { type: Boolean, required: false, default: false },

    // metadata
    soft_delete: { type: Boolean, default: false },
    created_time: { type: Date, default: Date.now },
    last_mod_time: { type: Date, default: Date.now }
});

const voiceBillingHistSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    payment_status: { type: String, default: "calculating", enum: ['calculating', 'billed', 'paid'] },
    billing_date: { type: Date, default: Date.now }, // for which month and year example: 08-2024
    cost: { type: Number, required: false, default: 0 }, // in dollar
    minutes: { type: Number, required: false, default: 0 },
    invoice_url: { type: String, required: false, default: "" },
    created_time: { type: Date, default: Date.now },
});

const paymentHistorySchema = new mongoose.Schema({
    // stripe session id is made optional bcz while cancelling the subscription we not get any session id and creating a payment history is important for cancelled plan
    stripe_session_id: { type: String, required: false },
    user_id: { type: String, required: true },
    payment_status: { type: String, default: "initated" }, // pending, initated, failed, paid
    currency: { type: String, required: true },
    cost: { type: Number, required: true },
    plan_id: { type: String, required: true },
    created_time: { type: Date, default: Date.now },
    country_iso: { type: String, default: "" },
    payment_decsription: {
        title: {
            type: String,
            default: ""
        },
        reason: {
            type: String,
            default: ""
        }
    },
    plan_type: { type: String, default: "" },
    invoice_url: { type: String, default: "" },
    payment_method: {
        name: {
            type: String,
            default: ""
        }, number: {
            type: Number,
            default: 0
        }
    },
    invoice_number:{type:String,default:0},
    unique_id:{type:String,required:true},
    next_payment:{type:Date,default:null},
  


});

module.exports = {
    PricePlan: mongoose.model('PricePlan', pricePlanSchema),
    VoiceAIPricePlan: mongoose.model('VoiceAIPricePlan', voiceAIPlanSchema),
    PaymentHistory: mongoose.model('PaymentHistory', paymentHistorySchema),
    CreditCard: mongoose.model('CreditCard', creditCardSchema),
    VoiceBilling: mongoose.model('VoiceBilling', voiceBillingHistSchema),
};
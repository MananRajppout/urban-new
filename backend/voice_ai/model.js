const { type } = require("dynamoose");
const mongoose = require("mongoose");
const calendarToolSchema = new mongoose.Schema({
  cal_api_key: {
    type: String,
    required: false,
    default: "",
  },
  cal_event_type_id: {
    type: String,
    required: false,
    default: "",
  },
  cal_timezone: {
    type: String,
    required: false,
    default: "America/Los_Angeles",
  },
});
const aiAgentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: "Urbanchat Assistant",
  },
  base_prompt: {
    type: String,
    required: true,
    default:
      "You are a helpful phone assistant for a pizza restaurant.The restaurant is open between 10-12 pm.You can help the customer reserve a table for the restaurant.",
  },
  chatgpt_model: {
    type: String,
    required: true,
    default: "cerebras/llama-4-scout-17b-16e-instruct",
  },
  STT_name: {
    type: String,
    required: true,
    default: "deepgram",
  },
  who_speaks_first: {
    type: String,
    required: true,
    default: "ai",
  },
  welcome_msg: {
    type: String,
    required: true,
    default: "Hello, how are you?",
  },
  twilio_phone_number: {
    type: String,
    default: "",
  },
  plivo_phone_number: {
    type: String,
    default: "",
  },
  voice_engine_name: {
    type: String,
    required: false,
    default: "deepgram", //elevenlabs, sarvam
  },

  voice_id: {
    type: String,
    required: true,
    default: "aura-2-asteria-en",
  },
  voice_name: {
    type: String,
    required: true,
    default: "Asteria",
  },
  call_transfer_prompt: {
    type: String,
    required: false,
    default: "",
  },
  transfer_call_number: {
    type: String,
    required: false,
    default: "",
  },
  calendar_tools: [calendarToolSchema],
  privacy_setting: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  ambient_sound: {
    type: String,
    default: "",
  },
  ambient_sound_volume: {
    type: Number,
    default: 1.0,
  },
  responsiveness: {
    type: Number,
    default: 1.0,
  },
  interruption_sensitivity: {
    type: Number,
    default: 1.0,
  },
  // active_stt_provider:{
  //   type:String,
  //   default:"11labs" // 11labs, sarvam
  // },
  //use this field for speed voice settings
  voice_speed: {
    type: Number,
    default: 1,
  },
  voice_loudness: {
    type: Number,
    default: 1, //(0.5 to 2.0)
  },
  voice_pitch: {
    type: Number,
    default: 0, //(-20.0 to 20.0)
  },

  //smallest perameters
  voice_consistency: {
    type: Number,
    default: 0.5, //0 <= x <= 1
  },
  voice_similarity: {
    type: Number,
    default: 0, //0 <= x <= 1
  },
  voice_enhancement: {
    type: Number,
    default: 1, //0 <= x <= 2
  },

  //elevanlabs perameters
  voice_stability: {
    type: Number,
    default: 0.5, //0 <= x <= 1
  },
  voice_style: {
    type: Number,
    default: 0, //0 <= x <= 1
  },

  voice_temperature: {
    type: Number,
    default: 0,
  },
  reminder_interval: {
    type: Number,
    default: 0,
  },
  reminder_count: {
    type: Number,
    default: 0,
  },
  boosted_keywords: {
    type: String,
    default: "",
  },
  fallback_voice_ids: {
    type: String,
    default: "",
  },
  enable_backchannel: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: "hi",
  },
  enable_speech_normalization: {
    type: Boolean,
    default: false,
  },
  end_call_duration: {
    type: Number,
    default: 600, // End the call if the user has stayed silent for given seconds
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
  updated_time: {
    type: Date,
    default: Date.now,
  },

  // add two more field by aayush
  ambient_stability: {
    type: Number,
    default: 0.5,
  },
  ambient_similarity: {
    type: Number,
    default: 0.5,
  },



  welcome_message_text: {type: String, default: "Hello' How can i assist you today."},
  welcome_message_file: {
    public_url: {type: String, default: undefined},
    publid_id: {type: String, default: null}
  },
  hang_up_prompt: {type: String, default: "When the user say goodbye."},
  silence_1_timeout: {type: Number,default: 15},
  silence_2_timeout: {type: Number,default: 15},
  silence_1_speech: {type: String,default: "You are here."},
  silence_2_speech: {type: String,default: "Thank's you for calling."},
  language: {type: String, default: "en"},
  stt_engine: {type: String, default: "nova-2-general"},
});

const twilioPhoneRecord = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  twilio_sid: {
    type: String,
    required: false,
    default: "",
  },
  twilio_phone_number: {
    type: String,
    required: true,
    unique: true,
    default: "",
  },
  phone_number_pretty: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  date_purchased: {
    type: Date,
    default: Date.now,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
  updated_time: {
    type: Date,
    default: Date.now,
  },
});

const telnyxPhoneRecord = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  twilio_sid: {
    type: String,
    required: false,
    default: "",
  },
  twilio_phone_number: {
    type: String,
    required: true,
    unique: true,
    default: "",
  },
  phone_number_pretty: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  date_purchased: {
    type: Date,
    default: Date.now,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
  updated_time: {
    type: Date,
    default: Date.now,
  },
});

const callHistorySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  caller_id: { type: String, required: true, unique: true },
  recording_sid: { type: String, required: false, default: "" },
  recording_url: { type: String, required: false, default: "" },
  transcription_text: { type: String, required: false, default: "" },
  calltype: { type: String, required: true, default: "" },
  direction: {
    type: String,
    default: "",
    required: false,
  },
  twilio_phone_number: { type: String, required: false },
  plivo_phone_number: { type: String, required: false },
  from_phone_number: { type: String, required: false, default: "" },
  voice_engine_id: { type: String, required: true, default: "" },
  chatgpt_model: { type: String, required: true, default: "" },
  agent_id: { type: String, required: true, default: "" },
  voice_name: { type: String, required: true, default: "" },
  voice_id: { type: String, required: true, default: "" },
  start_time: { type: Date, required: false, default: Date.now },
  sheet_call: { type: Boolean, required: false, default: false },
  end_time: { type: Date, required: false, default: Date.now },
  cost: { type: Number, required: false, default: 0.0 },
  created_time: { type: Date, default: Date.now },
  chat_history: [
    {
      role: { type: String, enum: ["user", "agent"], required: true },
      content: { type: String, required: false },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  summary: { type: String, required: false, default: "" },
  call_status: {
    type: String,
    enum: ["Successful", "Unsuccessful"],
    required: true,
    default: "Unsuccessful",
  },
  user_sentiment: {
    type: String,
    enum: ["Positive", "Neutral", "Negative"],
    required: true,
    default: "Neutral",
  },
  disconnection_reason: { type: String, required: false, default: "" },
  call_duration: {
    type: Number,
    default: 0,
  },
  call_state: {
    type: String,
    // enum: ["active", "completed", "failed"],
    default: "",
  },
 
});

// It's the child of CallHistory model
const callSessionLogsSchema = new mongoose.Schema({
  user_id: { type: String, required: true, default: "" },
  caller_id: { type: String, required: true },
  ai_reply_voice_url: { type: String, required: false, default: "" },
  user_msg_voice_url: { type: String, required: false, default: "" },

  ai_reply_text: { type: String, required: false, default: "" },
  user_msg: { type: String, required: false, default: "" },

  created_time: { type: Date, default: Date.now },
});

const voiceAiInvoiceSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, default: "" },
    payment_type: {
      type: String,
      default: "Voice AI Calling", // Define available payment types as needed
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["init", "pending", "completed", "failed"],
      default: "init",
    },
    payment_intent_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const sheetConfigSchema = new mongoose.Schema(
  {
    agent_id: { type: String, required: true },
    user_id: { type: String, required: true },
    sheet_call: { type: Boolean, default: false },
    spreadsheet_id: { type: String, required: true },
    sheet_name: { type: String, required: true },
    column_mappings: {
      type: Object,
      required: true,
      validate: {
        validator: function (v) {
          return (
            v &&
            typeof v === "object" &&
            "<phone number>" in v &&
            "<customer name>" in v &&
            "<context>" in v
          );
        },
        message:
          "Column mappings must include <phone number>, <customer name>, and <context>",
      },
    },
    mapped: {
      name: { type: String, default: "customer name" },
      phone: { type: String, default: "phone number" },
      context: { type: String, default: "context" },
      summary: { type: String, default: "summary" },
      call_status: { type: String, default: "status" },
    },
    current_row: { type: Number, default: 2 },
    is_active: { type: Boolean, default: false },
    last_processed_time: { type: Date },
    status: {
      type: String,
      enum: ["idle", "processing", "paused", "completed", "error"],
      default: "idle",
    },
    total_rows: { type: Number, default: 0 },
    processed_rows: { type: Number, default: 0 },
    successful_calls: { type: Number, default: 0 },
    failed_calls: { type: Number, default: 0 },
    call_delay: { type: Number, default: 5000 }, // Delay between calls in ms
    error_message: { type: String },
    last_error_time: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
sheetConfigSchema.virtual("progress").get(function () {
  if (!this.total_rows) return 0;
  return Math.round((this.processed_rows / this.total_rows) * 100);
});

// Compound index for active sheets
sheetConfigSchema.index(
  { agent_id: 1, is_active: 1 },
  {
    unique: true,
    partialFilterExpression: { is_active: true },
  }
);

// Method to validate column mappings
sheetConfigSchema.methods.validateRequiredColumns = function () {
  const requiredColumns = ["<phone number>", "<customer name>", "<context>"];
  return requiredColumns.every(
    (col) => this.column_mappings && this.column_mappings[col]
  );
};

// Pre-save middleware to ensure required columns
sheetConfigSchema.pre("save", function (next) {
  if (!this.validateRequiredColumns()) {
    next(new Error("Missing required column mappings"));
  }
  next();
});

const SheetConfig = mongoose.model("SheetConfig", sheetConfigSchema);

module.exports = {
  VoiceAiInvoice: mongoose.model("VoiceAiInvoice", voiceAiInvoiceSchema),
  AiAgent: mongoose.model("AiAgent", aiAgentSchema),
  TwilioPhoneRecord: mongoose.model("TwilioPhoneRecord", twilioPhoneRecord),
  TelnyxPhoneRecord: mongoose.model("TelnyxPhoneRecord", telnyxPhoneRecord),
  CallHistory: mongoose.model("CallHistory", callHistorySchema),
  CallSessionLogs: mongoose.model("CallSessionLogs", callSessionLogsSchema),
  SheetConfig,
  
};

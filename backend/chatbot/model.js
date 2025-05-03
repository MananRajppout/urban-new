const mongoose = require("mongoose");
const dynamoose = require('dynamoose');

// MongoDB Tables
const chatMiddlewareSchema = new mongoose.Schema({
    user_id: { type: String, required:true },
    credits_left : { type: Number, default: 0, required: false},
    created_time: { type: Date, default: Date.now },
    last_mod_time: { type: Date, default: Date.now },
});

const chatModelViewSchema = new mongoose.Schema({
    chat_model_id: { type: String, required:true, unique:true },
    user_id: { type: String, required:false }, // this is ORG ID from now on
    name: { type: String, required:false, default:''},
    bot_title: { type: String, required:false, default: 'Chatbot' },
    default_message: { type: String, required:false, default: 'Hi! What can I help you with?' },

    bot_theme : { type: String, required:false, default: 'light' }, // light, dark
    bot_background_color: { type: String, required:false, default: 'Dark' },
    bot_font_color : { type: String, required:false, default: 'default' },
    align_chat_bubble : { type: String, required:false, default: 'right' }, // left, right
    bot_picture : { type:String, required:false, default: ''},
    icon_or_popup: { type:String, required:false, default: ''},
    remove_powered_by : { type: Boolean, default: false },
    number_of_characters : { type: Number, required:false, default:0},
    auto_showing_initial_msg_in_seconds : { type: Number, required:false, default:1 },
    status: { type:String, required:false },
    suggested_messages: {type:String, default:''}, // coma seprated messages should be stored
    is_active: { type: Boolean, default: true },
    shopify_store_url: {type:String, default:''},

    typing_sound : { type: Boolean, default: false },
    five_days_auto_clean_chat:  { type: Boolean, default: false },
    leads_notification_on_mail: { type: Boolean, default: false },
    accept_leads : { type: Boolean, default:false },
    leads_title: {type:String, default:'Let us know how to contact you?'},
    enabled_leads_fields : { type:mongoose.Schema.Types.Mixed, default:{ email: true, phone_number: false, name: false }, required:false},

    //Security 
    limit_per_user_msgs : { type: Number, required:false, default:20},
    msg_after_user_msg_limit_reached : { type: String, required: false, default:"Too many messsages in a row." },
    restiction_over_time_to_sent_msg : { type: Number, required: false, default:1},
    allowed_domains: {type:String, required:false, default:'[]'},

    created_time: { type: Date, default: Date.now },
    last_mod_time: { type: Date, default: Date.now },
    last_trained : { type: Date, default: Date.now },
    last_mod_by: { type: String, required:false },
});

const chatBotSourceDetailSchema = new mongoose.Schema({
    chat_model_id: { type: String, required:false },
    created_time: { type: Date, default: Date.now },    
    user_id: { type: String, required:false },
    name: { type: String, required:false },
    num_of_characters: { type: Number, required:false, default:0 },
    type: { type: String, required:false },
    links: { type: String, required:false },
    is_text_input: { type: Boolean, required:false, default:false },
    url: { type: String, required:false },
    status: { type: String, required:false } // created , trained
});

const chatBotSourceSchema = new mongoose.Schema({
    chat_model_id: { type: String, required:true },
    chat_bot_source_detail_id : { type: String, required:true, unique:false },
    source_data:  { type: String, required:true, unique:false }
});

const leadSchema = new mongoose.Schema({
    chat_model_id: { type: String, required:true },
    title: { type:String, required:false, default:''},
    name: { type:String, required:false, default:''},
    email: { type:String, required:false, default:''},
    phone_number: { type:String, required:false, default:''},
    chat_session_id:{ type:String, required:false, default:''},

    created_time: { type: Date, default: Date.now },    
});

const chatHistory = new mongoose.Schema({
    chat_model_id: { type: String, required:true },
    user_msg: { type: String, required:false },
    chatbot_reply: { type: String, required:false },

    created_time: { type: Date, default: Date.now },    
});

const chatSessionSchema = new mongoose.Schema({
    chat_model_id: { type: String, required:true },
    user_msg: { type: String, required:false, default:''},
    lead_id: { type: String, required:false, default:null},
    chat_session_id: { type: String, required:true, default:null},

    created_time: { type: Date, default: Date.now },    
});

const chatSessionLogsSchema = new mongoose.Schema({
    chat_session_id: { type: String, required:true },
    user_msg: { type: String, required:false, default:''},
    chatbot_reply: { type: String, required:false, default:''},
    confidence_score: { type: Number, required:false, default:0},

    created_time: { type: Date, default: Date.now },    
});

const chatBotModelSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Primary key
    user_id: { type: String, required: true }, // this is ORG ID from now on
    chatgpt_model_type: { type: String, default:'gpt-4o'},
    base_prompt: { type: String, default:"" },
    training_data: { type: String, default:"" },
    temperature: { type: Number,default:0 },
    embedding_filename: { type: String },
    is_context_set: { type: Boolean, default:false},
    type: { type: String, default: 'standard' },
    is_alive: { type: Boolean },
    calendly_url: { type: String, default:"" },
    last_mod_by: { type: String, required:false },
});



// DynamoDB Tables 
// const chatBotModelSchema = new dynamoose.Schema({
//     id: String, // Primary key
//     user_id: String,
    
//     chatgpt_model_type: String,
//     base_prompt: String,
//     training_data: String,
//     temperature: Number,
//     embedding_filename:String,
//     is_context_set:Boolean,

//     type: String, // standard
//     is_alive: Boolean, 
// });

module.exports = {
    ChatMiddleware : mongoose.model('ChatMiddleware', chatMiddlewareSchema),
    ChatModel : mongoose.model('ChatModel', chatBotModelSchema),
    // ChatModel : dynamoose.model('ChatModel', chatBotModelSchema), // For fast access data
    ChatModelView : mongoose.model('ChatModelView', chatModelViewSchema), // chatbot configuration 
    ChatBotSourceDetail : mongoose.model('ChatBotSourceDetail', chatBotSourceDetailSchema), // summary of chat sources
    ChatBotSource: mongoose.model('ChatBotSource', chatBotSourceSchema), // chatbot model source data
    Lead : mongoose.model('Lead', leadSchema),
    ChatHistory :  mongoose.model('ChatHistory', chatHistory),
    ChatSession :  mongoose.model('ChatSession', chatSessionSchema),
    ChatSessionLogs :  mongoose.model('ChatSessionLogs', chatSessionLogsSchema)
};

// -> fetchChatBot if its alive then going to process the request to chatgpt, and call a async function to decrement credits, if credits <=0, make the current chatbot to is_alive false
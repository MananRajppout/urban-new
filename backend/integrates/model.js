const mongoose = require("mongoose");

const integrateSchema = new mongoose.Schema({
    chat_model_id: { type: String, required: true },
    user_id: { type: String, required: false },

    is_active: { type: Boolean, required:false, default:true},
    type: { type: String, default:'whatsapp', enum:['whatsapp', 'facebook']},
    status: { type: String, default:'unverified' }, 
    
    
    facebook_recipient_id:{ type: String, default:''},
    api_key: { type: String, default:''}, // In case of whatsapp its a access token 
    //whatsapp_fields
    whatsapp_phone_number: { type: String, required:false, default:0},
    phone_number_id: { type: String, required:false, default:0},
    whatsapp_business_ac_id: { type: String, required:false, default:0}
});


module.exports = {
    Integrate : mongoose.model('Integrate', integrateSchema),
};
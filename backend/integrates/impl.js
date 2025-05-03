const { getChatCompletionForIntegrates } = require('../chatbot/impl');
const {Integrate} = require('../integrates/model');
const { sendMessageToFacebook } = require('./facebook');

async function getIntegratesAdded(chat_model_id){
    var integrate_details = {};

    integrate_details['is_whatsapp_integrated'] = false;
    integrate_details['is_facebook_integrated'] = false;
    integrate_details['is_shopify_integrated'] = false;
    integrate_details['is_wordpress_integrated'] = false;

    
    if (await Integrate.exists({chat_model_id: chat_model_id, type:"whatsapp"})){
        integrate_details['is_whatsapp_integrated'] = true;
    }

    if (await Integrate.exists({chat_model_id: chat_model_id, type:"facebook"})){
        integrate_details['is_facebook_integrated'] = true;
    }
    return integrate_details;
}

async function replyToFacebook(facebook_recipient_id, sender_id, user_msg){
    const fbmiddleware = await Integrate.findOne({facebook_recipient_id});
    const response_msg = await getChatCompletionForIntegrates(fbmiddleware.chat_model_id, user_msg)
    await sendMessageToFacebook(sender_id, fbmiddleware.api_key, { text:response_msg });
}

module.exports = {
    getIntegratesAdded,
    replyToFacebook
}
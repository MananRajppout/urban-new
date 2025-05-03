const { default: axios } = require("axios");
const { ChatModelView } = require("../chatbot/model");
const {Integrate} = require("./model");

async function getOrCreateIntegrate(chat_model_id, integrate_type='whatsapp'){
    try{
        const integrate_find = await Integrate.findOne({chat_model_id:chat_model_id, type:integrate_type});
        if (integrate_find){
            return integrate_find;
        }
        if (! await ChatModelView.exists({chat_model_id:chat_model_id})) {
            return false;
        }
        integrate_payload = {
            chat_model_id:chat_model_id,
            type: integrate_type,
            status: "verified"
        }
        await Integrate.create(integrate_payload);
        return await getOrCreateIntegrate(chat_model_id, integrate_type);
    } catch(error){
        console.log("getOrCreateIntegrate Error: ",error)
        return false;
    }
}

async function send_whatsapp_message(phone_number_id, from, msg, access_token){
    const postData = {
        messaging_product: "whatsapp",
        to: from,
        text: {
            body: msg,
        },
    };

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
    };

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
            postData,
            { headers });

    } catch (error) {
        // Handle errors here
        console.error("send_whatsapp_message Error:", error);
    }

    return true;
}

module.exports = {
    send_whatsapp_message,
    getOrCreateIntegrate
}
const catchAsyncError = require("../middleware/catchAsyncError");
const { getChatCompletionForIntegrates} = require("../chatbot/impl");
const {send_whatsapp_message, getOrCreateIntegrate} = require("./whatsapp");
const {senderActionToFacebook, sendMessageToFacebook} = require("./facebook");
const { getSlackInstallUrl, slackCallbackHandler } = require("./slack");
const {Integrate} = require("./model");
const { replyToFacebook } = require("./impl");


exports.verifyWhatsappCallback = catchAsyncError(async (req, res, next) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
   
    return res.status(200).send(challenge);
    if (!token) {
      return res.status(403).send();
    }
    const integrate = await getOrCreateIntegrate(token, "whatsapp"); // basically the token is chat_model_id
    console.log(challenge);
    if (mode == "subscribe" && integrate && token == integrate.chat_model_id) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403);
    }
  });


exports.postWhatsappCallback = catchAsyncError(async (req, res, next) => {
    let body_param = req.body;
  
    if (body_param.object) { 
        if (
            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let user_msg = body_param.entry[0].changes[0].value.messages[0].text.body;

            const middleware = await Integrate.findOne({phone_number_id:phon_no_id});
            if (middleware.is_active){
                
                console.log("Webhook parameters are: " + JSON.stringify(body_param));
                response_msg = await getChatCompletionForIntegrates(middleware.chat_model_id, user_msg);
                await send_whatsapp_message(phon_no_id, from, response_msg, middleware.api_key);
                return res.sendStatus(200);
            }
        }
    }
    return res.sendStatus(404);
});


// API for users to update 
exports.updateWhatsappIntegrate = catchAsyncError(async (req, res, next) => {
    try{
        var { chat_model_id, integrate_type } = req.query;
        if (!integrate_type || integrate_type == 'whatsapp'){
            integrate_type = "whatsapp"

            const exist_integrate = await Integrate.findOne({phone_number_id:req.body.phone_number_id});
            if (exist_integrate){
                return res.status(400).json({message:"The phone number ID is already in use in some chatbot"});
            }
        }
        const integrate = await getOrCreateIntegrate(chat_model_id, integrate_type);
        for (const key in req.body) {
            integrate[key] = req.body[key]
        }

        await integrate.save();
        return res.status(200).json({message:"success"});

    }catch(error){
        console.log("updateWhatsappIntegrate Error", error)
        return res.status(500).json({message:"Something went wrong, please try again later"});
    }
});

exports.fetchIntegrate = catchAsyncError(async (req, res, next) => {
    try{
        var { chat_model_id, integrate_type } = req.query;
        if (!integrate_type){
            integrate_type = 'whatsapp'
        }
        const integrate = await Integrate.findOne({chat_model_id:chat_model_id, type:integrate_type})
        if (!integrate){
            return res.status(400).json({message:"Webhook is not verified yet"});
        }
        return res.status(200).json({message:"success", integrate:integrate});

    }catch(error){
        console.log("fetchIntegrate Error", error)
        return res.status(500).json({message:"Something went wrong, please try again later"});
    }
});


exports.verifyFacebookCallback = catchAsyncError(async (req, res, next) => { // Facebook verification, very similar to whatsapp webhook: in future please merge the both webhook
    console.log("coming here ", req.query)
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
    if (!token){
        return res.status(403).send();
    }
    const integrate = await getOrCreateIntegrate(token, 'facebook'); // basically the token is chat_model_id
    if ( integrate && token == integrate.chat_model_id) {
        return res.status(200).send(challenge);
    } else{
        return res.status(403);
    }
});

exports.postFacebookCallback = catchAsyncError(async (req, res, next) => {
    console.log("FACEBOOK CALLBACK: ", req.body)
        
    if (req.body.object === 'page'){
        /* Iterate over each entry, there can be multiple entries 
        if callbacks are batched. */
        req.body.entry.forEach(function(entry) {
            entry.messaging.forEach(function(event) {
                var senderID = event.sender.id;
                var message = event.message;
                if (message.text && !message.is_echo) {
                    // sendMessageToFacebook(senderID, )
                    replyToFacebook(event.recipient.id, senderID, message.text)
                }
            });
        });
    }
    return res.sendStatus(200);
});


exports.deleteIntegrate = catchAsyncError(async (req, res, next) => {
    await Integrate.deleteOne({ _id : req.body.integrate_id });
    return res.status(200).json({message:"integrate deleted successfully"});
});


exports.getSlackInstall = catchAsyncError(async (req, res, next) => {
    const chatbot_id = req.query.chatbot_id;
    const url = await getSlackInstallUrl(chatbot_id);
    res.send(url);
});

exports.slackWebhookCall = catchAsyncError(async (req, res, next) => {
    await slackCallbackHandler(req, res)
});
const { WebsiteNotification } = require("../user/model");

class WebNotification {

    async createNotification(data) {
        const notification = new WebsiteNotification({
            user_id: data.user_id,
            log_message: data.log_message,
            log_type: data.log_type || 'info'
        });
        await notification.save();
    }

    async trainingChatbot(data) {
        data.log_message = `Chatbot with ${data.chatmodel_id} has been Trained`;
        createNotification(data)
    }
}


module.exports = WebNotification;
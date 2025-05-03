const { default: axios } = require("axios");

function senderActionToFacebook(recipient_id, access_token) {
    axios.post('https://graph.facebook.com/v2.6/me/messages', {
        recipient: { id: recipient_id },
        sender_action: 'typing_on'
    }, {
        params: { access_token: access_token}
    })
    .then(response => {
        return true;
    })
    .catch(error => {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    });
};

function sendMessageToFacebook(recipient_id, access_token, message) {
    return new Promise((resolve, reject) => {
        axios.post('https://graph.facebook.com/v2.6/me/messages', {
            recipient: { id: recipient_id },
            message: message
        }, {
            params: { access_token: access_token }
        })
        .then(response => {
            resolve(response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
            reject(error.response ? error.response.data : error.message);
        });
    });
};



module.exports = {
    senderActionToFacebook,
    sendMessageToFacebook
}
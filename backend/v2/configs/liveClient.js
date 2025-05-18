const { SipClient } = require("livekit-server-sdk");



const sipClient = new SipClient(process.env.LIVEKIT_API_HOST,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET);


module.exports = sipClient;
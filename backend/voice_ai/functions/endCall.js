require("dotenv").config();

const telnyx = require("telnyx")(process.env.TELNYX_API_KEY);

const endCall = async function ({ callSid }) {
  try {
    // Retrieve the call using the call_control_id
    const call = new telnyx.Call({ call_control_id: callSid });

    // // Hang up the call
    const res = await call.hangup();
    console.log("\n\n\nEND CALL RES:", res);

    console.log("Call ended successfully");
    return "The call was ended successfully.";
  } catch (error) {
    console.error("Failed to end the call", error);
    return "The call could not be ended successfully. Advise the customer to call back later.";
  }
};

module.exports = endCall;

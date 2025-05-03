require("dotenv").config();

const telnyx = require("telnyx")(process.env.TELNYX_API_KEY);

const transferCall = async function ({ callSid, transferNumber }) {
  try {
    console.log(`Call transfer to ${transferNumber}`);
    // Retrieve the call using the call_control_id
    const call = new telnyx.Call({ call_control_id: callSid });

    // Transfer the call to the specified number
    const response = await call.transfer({
      to: transferNumber,
      timeout_secs: 60,
    });

    console.log("\n\n\nTRANSFER CALL RESPONSE:", response);
    console.log(`Call transferred successfully to ${transferNumber}`);
    return "The call was transferred successfully.";
  } catch (error) {
    console.error("Failed to transfer the call", error);
    return "The call could not be transferred successfully.";
  }
};

const forTestingTransferCall = async function ({ callSid, transferNumber }) {
  try {
    console.log(
      `For CallSID: ${callSid}, Call is being transferred to ${transferNumber}`
    );
    // Retrieve the call using the call_control_id

    telnyx.calls.transfer({
      call_control_id: callSid,
      to: transferNumber,
      timeout_secs: 60,
    });

    console.log(`Call transferred successfully to ${transferNumber}`);
    return "The call was transferred successfully.";
  } catch (error) {
    console.error("Failed to transfer the call", error);
    return "The call could not be transferred successfully";
  }
};

module.exports = transferCall;

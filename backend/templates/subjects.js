const subjectTitle = {
    "account_verification" : "Verify your UrbanChat account",
    "invite": "Exclusive Invitation to Transform Your Customer Engagement with Urbanchat.ai",
    "forgot_account" : "Verification code for Change Password",
    "delete_account" : "We're Sorry to See You Go",
    "message_quota_exceed" : "Important: Your UrbanChat.ai Message Quota has Been Reached",
    "payment_confirmation" : "Payment Confirmation - Your urbanchat.ai Subscription",
    "signup_confirmation" : "Welcome to UrbanChat.ai!" ,
    "org_invite_user":"hey you are inviting on our website of urbanchat.ai",
    "daily_call_summary": "Daily Call Summary - UrbanChat.ai",
    "individual_call_summary": "Call Summary - UrbanChat.ai"
};

// function parse(str) {
//     var args = [].slice.call(arguments, 1),
//         i = 0;

//     return str.replace(/%s/g, () => args[i++]);
// }

function getMailSubject(action, ) {
    return subjectTitle[action];
}

module.exports = {
    getMailSubject
};
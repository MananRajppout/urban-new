const { InstallProvider } = require('@slack/oauth');

const installer = new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    // stateSecret: '7htGfE2P',
    stateVerification:false
});

async function getSlackInstallUrl(chatbot_id) {
    try {
        const url = await installer.generateInstallUrl(options={
            scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook', 'im:history', 'chat:write.public','files:write', 'pins:write',"reactions:write", "im:write",
            "mpim:write",
            "users:read",
            "users:read.email",
            "usergroups:read",
            "emoji:read",
            "users.profile:read",
            "users:write",
            "app_mentions:read",
            "files:read",
            "channels:history",
            "groups:history",
            "mpim:history",
            "pins:read",
            "reactions:read"],
            metadata: JSON.stringify({chatbot_id}),
            redirectUri:'https://backend.urbanchat.ai/api/slack/oauthRedirect'
        }, stateVerification=false );
        console.log("slack install url : ", url)
        return `<a href=${url}><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`
    } catch (error) {
        console.log("Error in getSlackInstallUrl ", error)
        return ""
    }
}

const slackCallbackOptions = {
    success: (installation, options, req, res) => {
     console.log("1slack callback data: ", options, installation, req.query);
      const metadata = JSON.parse(installation.metadata || '{}');
      const chatbot_id = metadata.chatbot_id;
      console.log("2slack callback data: ",chatbot_id, metadata);


      res.send('successful!');
    },
    failure: (error, installOptions , req, res) => {
      console.log("slack options error : ", error, "installOptions", installOptions)
      res.send('failure');
    },
}
  

async function slackCallbackHandler(req, res) {
    await installer.handleCallback(req, res, slackCallbackOptions);
}

module.exports = {
    getSlackInstallUrl,
    slackCallbackHandler
}
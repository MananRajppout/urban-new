import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "../styles/chat-box-iframe.css";
// import '../styles/page.css'
import { useRouter } from "next/router";
import { getChatbotSettings } from "../lib/api/ApiChatbot";
import { useTheme } from "next-themes";

export default function ChatBoxIframe({
  defaultId,
  isSmall = false,
  skipLimit = false,
  catchHistory = true,
  disableTheme = false,
  isPrivate = false,
}) {
  const { resolvedTheme, setTheme } = useTheme();

  const [isLoaded, setIsLoaded] = useState(false);
  const [setting, setSetting] = useState({
    isDark: false,
    suggestedMsg: [],
    initialMsg: [],
    title: "",
    icon: "",
    autoInitialMsgAfter: 0,
    msgCoolDownTime: 1,
    maxMsgAllow: 5,
    isActive: true,
    isPowered: true,
    userMsgColor: "",
    leadTitle: "",
    acceptLead: false,
    acceptLeadName: false,
    acceptLeadEmail: false,
    acceptLeadPhone: false,
    limitReachMsg: "",
    calendlyUsername: "",
  });

  const [acceptLead, setAcceptLead] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (defaultId) {
      loadData(defaultId);
    } else {
      if (id) loadData(id);
    }
  }, [id, resolvedTheme]);

  async function loadData(id) {
    try {
      const res = await getChatbotSettings(id);
      if (res.data) {
        console.log(res.data);

        let isDark = res.data.view[0].bot_theme == "light" ? false : true;
        const suggestedMsg = res.data.view[0].suggested_messages
          .split("\n")
          .filter((item) => item);
        const initialMsg = res.data.view[0].default_message
          .split("\n")
          .filter((item) => item);
        const autoInitialMsgAfter =
          res.data.view[0].auto_showing_initial_msg_in_seconds;
        const msgCoolDownTime =
          res.data.view[0].restiction_over_time_to_sent_msg;
        const maxMsgAllow = res.data.view[0].limit_per_user_msgs;
        const isPowered = res.data.view[0].remove_powered_by;
        const isActive = res.data.view[0].is_active;
        const userMsgColor = res.data.view[0].bot_font_color;
        const leadTitle = res.data.view[0].leads_title;
        const acceptLead = res.data.view[0].accept_leads;
        const acceptLeadName = res.data.view[0].enabled_leads_fields.name;
        const acceptLeadEmail = res.data.view[0].enabled_leads_fields.email;
        const acceptLeadPhone =
          res.data.view[0].enabled_leads_fields.phone_number;

        let calendlyUrl = res.data.chatbot_model.calendly_url;
        let calendlyUsername = "";

        // parse the calendly username
        if (calendlyUrl) {
          const chunks = calendlyUrl.split("/");
          for (let index = 0; index < chunks.length; index++) {
            const iterator = chunks[index];

            if (iterator == "calendly.com" && index + 1 < chunks.length) {
              calendlyUsername = chunks[index + 1];
              break;
            }
          }
        }

        // TODO fix this later on light theme
        if (disableTheme) {
          const isCurrentDark = resolvedTheme == "light" ? true : false;
          isDark = isCurrentDark;
        }

        const da = {
          isDark: isDark,
          suggestedMsg: suggestedMsg,
          initialMsg: initialMsg,
          title: res.data.view[0].name,
          icon: res.data.view[0].bot_picture,
          autoInitialMsgAfter: autoInitialMsgAfter,
          msgCoolDownTime: msgCoolDownTime,
          maxMsgAllow: maxMsgAllow,
          isActive: isActive,
          isPowered: !isPowered,
          userMsgColor: userMsgColor,
          leadTitle: leadTitle,
          acceptLead: acceptLead,
          acceptLeadName: acceptLeadName,
          acceptLeadEmail: acceptLeadEmail,
          acceptLeadPhone: acceptLeadPhone,
          limitReachMsg: res.data.view[0].msg_after_user_msg_limit_reached,
          calendlyUsername: calendlyUsername,
        };

        setAcceptLead(acceptLead);
        setSetting(da);

        setIsLoaded(true);
      } else {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="chat">
      {isLoaded && (
        <ChatBox
          isTest={false}
          leadTitle={setting.leadTitle}
          chatbotId={defaultId ? defaultId : id}
          isActive={setting.isActive}
          isPowered={setting.isPowered}
          autoInitialMsgAfter={setting.autoInitialMsgAfter}
          msgCoolDownTime={setting.msgCoolDownTime}
          maxMsgAllow={setting.maxMsgAllow}
          icon={setting.icon}
          title={setting.title}
          isDark={setting.isDark}
          suggestedMsg={setting.suggestedMsg}
          initialMsg={setting.initialMsg}
          userMsgColor={setting.userMsgColor}
          isSmall={isSmall}
          acceptLead={acceptLead}
          skipLimit={skipLimit}
          cacheHistory={catchHistory}
          acceptEmail={setting.acceptLeadEmail}
          acceptName={setting.acceptLeadName}
          acceptPhone={setting.acceptLeadPhone}
          limitReachMsg={setting.limitReachMsg}
          isPrivate={isPrivate}
          calendlyUsername={setting.calendlyUsername}
        />
      )}
      {!isLoaded && <div className="skeleton" style={{ minHeight: 300 }}></div>}
    </div>
  );
}

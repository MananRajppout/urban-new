import React, { useContext, useEffect, useState } from "react";

import Toggle from "../../Widget/Toggle";
import toast from "react-hot-toast";
import { ServerDataContext } from "../../../pages/my-chatbot/update/[id]";
import { updateChatbotById } from "../../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";

export default function Notifications() {
  const { serverData, setServerData } = useContext(ServerDataContext);
  const [isSaving, setIsSaving] = useState(false);

  const [typingSound, setTypingSound] = useState(false);
  const [autoClean, setAutoClean] = useState(false);
  const [notification, setNotification] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  // typing_sound, five_days_auto_clean_chat, leads_notification_on_mail

  useEffect(() => {
    setTypingSound(serverData.view[0].typing_sound);
    setAutoClean(serverData.view[0].five_days_auto_clean_chat);
    setNotification(serverData.view[0].leads_notification_on_mail);
  }, []);

  async function onSave() {
    if (isSaving) return;

    if (
      typingSound == serverData.view[0].typing_sound &&
      notification == serverData.view[0].leads_notification_on_mail &&
      autoClean == serverData.view[0].five_days_auto_clean_chat
    ) {
      toast.error("Please update something first");
      return;
    }

    setIsSaving(true);
    const res = await updateChatbotById(id, {
      typing_sound: typingSound,
      five_days_auto_clean_chat: autoClean,
      leads_notification_on_mail: notification,
    });
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        raw.view[0].typing_sound = typingSound;
        raw.view[0].five_days_auto_clean_chat = autoClean;
        raw.view[0].leads_notification_on_mail = notification;
        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=domain`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=general`);
  }
  return (
    <div>
      <div>
        <div className="col-2" style={{ gap: 60 }}>
          <div>
            <h2>Notifications</h2>

            <div className="checkbox-container">
              <div>
                <h3 style={{ marginBottom: 12 }}>Message alert</h3>
                <p style={{ marginTop: 12 }} className="input-title">
                  Allow weather to show notification or not
                </p>
              </div>
              <Toggle
                onToggle={(value) => setNotification(value)}
                isOn={notification}
              />
            </div>

            <div className="checkbox-container">
              <div>
                <h3 style={{ marginBottom: 12 }}>Typing sound</h3>
                <p style={{ marginTop: 12 }} className="input-title">
                  Enable or disable typing sound
                </p>
              </div>
              <Toggle
                onToggle={(value) => setTypingSound(value)}
                isOn={typingSound}
              />
            </div>

            <div className="checkbox-container">
              <div>
                <h3 style={{ marginBottom: 12 }}>Five days auto clean</h3>
                <p style={{ marginTop: 12 }} className="input-title">
                  Enable or disable five days auto clean
                </p>
              </div>
              <Toggle
                onToggle={(value) => setAutoClean(value)}
                isOn={autoClean}
              />
            </div>
          </div>
        </div>

        <div className="button-holder">
          <button className="secondary" onClick={previousTab}>
            Previous
          </button>
          <button onClick={onSave} className="primary">
            {isSaving ? <span className="loading mini"></span> : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

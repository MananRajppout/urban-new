import React, { useContext, useEffect, useState } from "react";

import Toggle from "../../Widget/Toggle";
import { ServerDataContext } from "@/pages/my-chatbot/update/[id]";
import { updateChatbotById } from "@/lib/api/ApiUpdateChatbot";

import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Leads() {
  const { serverData, setServerData } = useContext(ServerDataContext);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [accept, setAccept] = useState(false);
  const [acceptName, setAcceptName] = useState(false);
  const [acceptEmail, setAcceptEmail] = useState(false);
  const [acceptPhone, setAcceptPhone] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setTitle(serverData.view[0].leads_title);
    setAccept(serverData.view[0].accept_leads);
    setAcceptName(serverData.view[0].enabled_leads_fields.name);
    setAcceptEmail(serverData.view[0].enabled_leads_fields.email);
    setAcceptPhone(serverData.view[0].enabled_leads_fields.phone_number);
  }, []);

  async function onSave() {
    if (isSaving) return;

    if (
      title == serverData.view[0].leads_title &&
      accept == serverData.view[0].accept_leads &&
      acceptName == serverData.view[0].enabled_leads_fields.name &&
      acceptEmail == serverData.view[0].enabled_leads_fields.email &&
      acceptPhone == serverData.view[0].enabled_leads_fields.phone_number
    ) {
      toast.error("Please update something first");
      return;
    }

    setIsSaving(true);
    const res = await updateChatbotById(id, {
      accept_leads: accept,
      leads_title: title,
      enabled_leads_fields: {
        name: acceptName,
        email: acceptEmail,
        phone_number: acceptPhone,
      },
    });
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        raw.view[0].accept_leads = accept;
        raw.view[0].leads_title = title;
        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=general`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=security`);
  }


  return (
    <div>
      <div>
        <div className="col-2" style={{ gap: 60 }}>
          <div>
            <h2>Leads</h2>

            <p className="input-title">Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Title"
            />

            <div className="checkbox-container">
              <div>
                <h3 style={{ marginBottom: 12 }}>Accept Leads</h3>
                <p style={{ marginTop: 12 }} className="input-title">
                  Allows whether to accept leads or not
                </p>
              </div>
              <Toggle onToggle={(value) => setAccept(value)} isOn={accept} />
            </div>

            <br />
            {accept && (
              <div className="leads-options">
                <div className="checkbox-container">
                  <h3>Name</h3>
                  <Toggle
                    onToggle={(value) => setAcceptName(value)}
                    isOn={acceptName}
                  />
                </div>
                <div className="checkbox-container">
                  <h3>Email</h3>
                  <Toggle
                    onToggle={(value) => setAcceptEmail(value)}
                    isOn={acceptEmail}
                  />
                </div>
                <div className="checkbox-container">
                  <h3>Phone</h3>
                  <Toggle
                    onToggle={(value) => setAcceptPhone(value)}
                    isOn={acceptPhone}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="button-holder">
          <button className="secondary" onClick={previousTab}>Previous</button>
          <button onClick={onSave} className="primary">
            {isSaving ? <span className="loading mini"></span> : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

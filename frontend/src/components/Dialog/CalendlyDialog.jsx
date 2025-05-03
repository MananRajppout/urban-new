import React, { useContext, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import {
  updateChatbotById,
  verifyFacebook,
} from "../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";
import Link from "next/link";

import calendlyImg from "@/assets/Icons/calendly.png";
import { ServerDataContext } from "@/pages/my-chatbot/update/[id]";
import { isValidURL } from "@/Utils";

export default function CalendlyDialog({ isOpen, onDialogClose }) {
  const router = useRouter();
  const { id } = router.query;
  const { serverData, setServerData } = useContext(ServerDataContext);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (serverData) {
      console.log(serverData.chatbot_model.calendly_url);
      setUrl(serverData.chatbot_model.calendly_url);
    }
  }, [serverData]);

  function close(className) {
    if (isSaving) return;
    if (className == "dialog-outer") {
      onDialogClose();
    }
  }

  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!isValidURL(url) && url !== "") {
      toast.error("Invalid URL");
      return;
    }

    const data = {
      calendly_url: url,
    };
    if (isSaving) return;
    setIsSaving(true);
    const res = await updateChatbotById(id, data);
    setIsSaving(false);
    if (res.data) {
      setServerData((old) => {
        const clone = structuredClone(old);
        clone.chatbot_model.calendly_url = url;
        return clone;
      });
      toast.success("Calendly URL updated successfully");
      onDialogClose();
    } else {
      toast.error(res.message);
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) => close(e.target.className)}
        >
          <div className="dialog shopify calendly">
            <div className="layer">
              <img src={calendlyImg.src} alt="shopify" />
            </div>

            {/* TODO hide for now */}

            <div className="input-container">
              <p className="heading">Calendly URL</p>
              <div className="grid-auto-max">
                <div className="input-container">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://calendly.com/your_username"
                    style={{ width: "100%" }}
                    className="text-field"
                  />
                </div>
                <button onClick={save} className="primary hover">
                  {isSaving ? <span className="loading mini"></span> : "Save"}
                </button>
              </div>
            </div>
            <br />
            <br />
            <p className="note center">
              To enable calendly read this doc{" "}
              <Link href="/integration/calendly" target="_blank">click here</Link>. Leave it
              empty to disable calendly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

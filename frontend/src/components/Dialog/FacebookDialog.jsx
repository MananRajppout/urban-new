import React, { useEffect, useRef, useState } from "react";

import Steps from "../Widget/Steps";
import Toggle from "../Widget/Toggle";
import toast from "react-hot-toast";
import {
  addFacebookIntegration,
  verifyFacebook,
} from "../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";
import Link from "next/link";

export default function FacebookDialog({
  isOpen,
  onDialogClose,
  defaultIndex = 0,
}) {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState(0);
  const [isProcess, setIsProcess] = useState(false);

  useEffect(() => {
    setActiveTab(defaultIndex);
  }, []);

  const formData = useRef({
    api_key: "",
  });

  async function onVerify() {
    if (isProcess) return;

    setIsProcess(true);

    // "0e70e5da-c527-43cd-9992-71643a34eb19"
    const res = await verifyFacebook(id);
    console.log(res);

    if (res.data) {
      changeTab(1);
    } else {
      toast.error(res.message);
    }

    setIsProcess(false);
  }

  async function onAddAccount() {
    if (isProcess) return;

    if (!formData.current.api_key) {
      toast.error("All field should be filled first!");
      return;
    }

    setIsProcess(true);
    const res = await addFacebookIntegration(id, formData.current);

    if (res.data) {
      changeTab(2);
    } else {
      toast.error(res.message);
    }

    setIsProcess(false);
  }

  function changeTab(index) {
    setActiveTab(index);
  }

  function close(className) {
    if (isProcess) return;

    if (className == "dialog-outer") {
      onDialogClose();
      changeTab(0);
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) => close(e.target.className)}
        >
          <div className="dialog">
            <h3 className="title">Integrate with Facebook</h3>
            <Steps count={3} index={activeTab} />
            {activeTab == 0 && (
              <>
                <p className="note">
                  Instruction for integrating your chatbot with Facebook{" "}
                  <Link href="/integration/facebook">here</Link>
                </p>

                <div className="input-container">
                  <p className="heading">Webhook Callback URL</p>
                  <div className="grid-auto-max">
                    <p className="text-field">
                      https://urbanchat.ai/api/facebook/webhook
                    </p>
                    <button
                      onClick={(e) =>
                        copy("https://urbanchat.ai/api/facebook/webhook")
                      }
                      className="copy-btn hover"
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="input-container">
                  <p className="heading">Webhook Verification Token</p>
                  <div className="grid-auto-max">
                    <p className="text-field">{id}</p>
                    <button
                      onClick={(e) => copy(id)}
                      className="copy-btn hover"
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <button className="primary submit-btn hover" onClick={onVerify}>
                  {isProcess ? (
                    <span className="loading mini"></span>
                  ) : (
                    "Verify"
                  )}
                </button>
              </>
            )}

            {activeTab == 1 && (
              <>
                <div className="input-container">
                  <p className="heading">Add Page Access Token</p>
                  <input
                    style={{ width: "100%" }}
                    onChange={(e) =>
                      (formData.current.api_key = e.target.value)
                    }
                    className="text-field"
                  />
                </div>

                <button className="primary submit-btn hover" onClick={onAddAccount}>
                  {isProcess ? (
                    <span className="loading mini"></span>
                  ) : (
                    "Add Account"
                  )}
                </button>
              </>
            )}

            {activeTab == 2 && (
              <>
                <div className="status-card">
                  <div className="left">
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.75 2A2.25 2.25 0 0 1 18 4.25v15.5A2.25 2.25 0 0 1 15.75 22h-7.5A2.25 2.25 0 0 1 6 19.75V4.25A2.25 2.25 0 0 1 8.25 2h7.5Zm0 1.5h-7.5a.75.75 0 0 0-.75.75v15.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75Zm-2.501 14a.75.75 0 0 1 .002 1.5l-2.5.004a.75.75 0 0 1-.002-1.5l2.5-.004Z"
                        fill="#2ECC70"
                      />
                    </svg>
                    <span>4654654654</span>
                  </div>
                  <div className="right">
                    <span>Active</span>
                    <Toggle isOn={true} />
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.03 2.97a3.578 3.578 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.578 3.578 0 0 1 5.06 0ZM15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.938L17.94 9 15 6.06Zm2.03-2.03-.97.97L19 7.94l.97-.97a2.079 2.079 0 0 0-2.94-2.94Z"
                        fill="#DDE6E8"
                      />
                    </svg>
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z"
                        fill="#E84B3C"
                      />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

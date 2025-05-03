import React, { useState } from "react";
import "../../styles/CreateChatbot/common.css";
import "../../styles/CreateChatbot/extra-tab-common.css";
import deleteLogo from "../../assets/Icons/delete.svg";
import logo from "../../assets/logo.svg";
import { deleteChatbot } from "../../lib/api/ApiUpdateChatbot";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useRole } from "@/hooks/useRole";

export default function Delete() {
  const [isProcess, setIsProcess] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  async function onDelete() {
    if (isProcess) return;

    setIsProcess(true);
    const res = await deleteChatbot(id);
    if (res.data) {
      toast.success("Chatbot deleted");
      router.push("/my-chatbot");
    } else {
      toast.error(res.message);
    }

    setIsProcess(false);
  }
  const { canChatbotDelete } = useRole();

  return (
    <div className="main-content-holder small delete-tab">
      <div className="header">
        <img className="icon" src={logo.src} alt="logo" />
      </div>

      <div className="content">
        <div className="inner">
          <div className="logo">
            <img src={deleteLogo.src} />
          </div>
          <h3>Delete Chatbot</h3>
          <p>
            Are you sure you want to delete your chatbot...? This action cannot
            be undone.
          </p>
          <div className="button-holder">
            <button
              disabled={!canChatbotDelete}
              className="hover"
              onClick={onDelete}
            >
              {isProcess ? <span className="loading"></span> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

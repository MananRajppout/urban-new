import React from "react";
import "../../styles/CreateChatbot/common.css";
import "../../styles/CreateChatbot/extra-tab-common.css";
import logo from "../../assets/logo.svg";
import copyIcon from "../../assets/Icons/CopyIcon.svg";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Share() {

  const router = useRouter();
  const { id } = router.query;


  function copyUrl() {
    toast.success("Url copied")
    navigator.clipboard.writeText('https://urbanchat.ai/chatbot-iframe/' + id)

  }
  return (
    <div className="main-content-holder small share-tab">
      <div className="header">
        <img className="icon" src={logo.src} alt="logo" />
      </div>

      <div className="content">
        <div className="link-container">
          <input disabled type="text" value={'https://urbanchat.ai/chatbot-iframe/' + id} />
          <button onClick={copyUrl} className="hover">Copy Link</button>
        </div>
      </div>
    </div>
  );
}

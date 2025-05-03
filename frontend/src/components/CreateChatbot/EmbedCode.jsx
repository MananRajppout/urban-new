import React, { useEffect, useRef, useState } from "react";
import "@/styles/CreateChatbot/common.css";
import "@/styles/CreateChatbot/extra-tab-common.css";
import logo from "@/assets/logo.svg";
import copyIcon from "@/assets/Icons/Copy.png";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function EmbedCode() {
  const router = useRouter();
  const { id } = router.query;
  const [code, setCode] = useState("");
  useEffect(() => {
    const cleanCode = `<script>
    const urbanChatbotId = "${id}"
  </script>\n
  <script src="https://urbanchat.ai/integration/chatbot-integration.js"></script>`;
    setCode(cleanCode);
  }, [id]);

  function copyCode() {
    navigator.clipboard.writeText(code);
    toast.success("Code copied");
  }

  return (
    <div className="main-content-holder small embed-code">
      <div className="header">
        <img className="icon" src={logo.src} alt="logo" />
      </div>

      <div className="content">
        <p style={{ textAlign: "center", color: "white" }}>
          To add a chat bubble to the bottom right of your website add this
          script tag to your html
        </p>
        <div className="code-area">
          <code>{code}</code>
          <button onClick={copyCode} className="hover primary responsive-hide">
            Copy Code
          </button>
        </div>

        <button onClick={copyCode} className="hover primary btn-outside">
          Copy Code
        </button>
      </div>
    </div>
  );
}

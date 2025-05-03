import React from "react";
import ChatBoxIframe from "../ChatBoxIframe";

export default function Chatbot() {
  return (
    <>
      <br />
      <br />
    <br />
      <div
        className="demo-bot"
        style={{ maxWidth: 850, marginLeft: "auto", marginRight: "auto" }}
      >
        <ChatBoxIframe isSmall={true} skipLimit={true} isPrivate={true} />
      </div>
    </>
  );
}

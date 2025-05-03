import React from "react";
import ChatBoxIframe from "../components/ChatBoxIframe";
import "../styles/preview-page.css";
import Bot from "@/components/Bot";
import Head from "next/head";

function Preview() {
  return (
    <div className="preview-page">
      <Head>
        <title>
          Live Demo of UrbanChat.ai: Experience AI Chatbot in Action
        </title>
        <meta
          name="description"
          content="Ask anything about urbanchat.ai and get instant, accurate responses from a chatbot trained on our data. Automate customer support, enhance UX, and drive sales across platforms."
          key="desc"
        />
      </Head>
      <div className="page">
        <h2>Ask Anything with Our AI-Powered Chatbot</h2>
        <p>
          This chatbot was trained on a document explaining UrbanChat, You can
          embed a widget like this on any page on your website!
        </p>
        <br />
        <br />
        <div
          className="demo-bot"
          style={{ maxWidth: 850, marginLeft: "auto", marginRight: "auto" }}
        >
          <ChatBoxIframe
            defaultId={"9a0b01e0-e028-4cea-9763-31f536ffa27f"}
            isSmall={true}
            catchHistory={false}
            skipLimit={true}
            disableTheme={true}
          />
        </div>
      </div>
    </div>
  );
}

export default Preview;

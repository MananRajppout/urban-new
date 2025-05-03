import react from "react";
import ChatBox from "../ChatBox";
import "@/styles/HomePage/live-demo.css";
import logo from "@/assets/logo.svg";

import liveDemoIcon from "@/assets/Icons//live-demo.svg";
import ChatBoxIframe from "../ChatBoxIframe";

export default function LiveDemo() {
  return (
    <div className="live-demo-section">
      <div className="page">
        <div>
          <div className="live-demo">
            <img src={liveDemoIcon.src} alt="live demo" />
            <h2>Live Demo</h2>
          </div>
          <p>
            This chatbot was trained on a document explaining Urbanchat, <br />
            UrbanChat You can embed a widget like this on any page on your
            website....!
          </p>
          <div className="chat-bot-holder demo-bot">
            {/* <ChatBox cacheHistory={false}
              chatbotId="138f922e-b3ca-461f-8cfe-3ba5cf484009"
              icon={logo.src}
              isSmall={true}
              skipLimit={true}
            /> */}
            <ChatBoxIframe
              defaultId={"9a0b01e0-e028-4cea-9763-31f536ffa27f"}
              skipLimit={true}
              catchHistory={false}
              disableTheme={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

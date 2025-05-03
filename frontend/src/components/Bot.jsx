import { useEffect } from "react";

export default function Bot() {
  // 9a0b01e0-e028-4cea-9763-31f536ffa27f
  useEffect(() => {
    const div = document.createElement("div");
    div.id = "chatbot-script-container";

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = `var urbanChatbotId = "a23243e9-7288-4f4c-888f-061b7b343e95";`;
    div.appendChild(script);

    var script2 = document.createElement("script");
    script2.type = "text/javascript";
    // script2.src = "http://localhost:3000/integration/chatbot-integration.js";
    script2.src = "https://urbanchat.ai/integration/chatbot-integration.js";
    div.appendChild(script2);

    document.body.appendChild(div);

    return () => {
      document.body.removeChild(div);

      const botCss = document.body.querySelector("#urban-chat-css");
      const botDive = document.body.querySelector("#urban-chat-box");
      if (botCss) document.body.removeChild(botCss);
      if (botDive) document.body.removeChild(botDive);
    };
  }, []);
  return <></>;
}

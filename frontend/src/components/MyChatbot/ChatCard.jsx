import React from "react";
import "@/styles/MyChatbot/chatCard.css";
import botIcon from "../../assets/Icons/bot.png";
import fileIcon from "../../assets/Icons/fileIcon.svg";
import helpIcon from "../../assets/Icons/helpIcon.svg";
import textIcon from "../../assets/Icons/textIcon.svg";
import Link from "next/link";

export default function ChatCard({ type, title, content, chatbotId }) {
  return (
    <Link href={'/my-chatbot/update/' + chatbotId}>
      <div className="chat-card">
        <div className="content">
          <img src={content} />
        </div>
        <div className="title">
          <div className="icon">
            <img src={botIcon.src} />
            {/* {type == "link" && <img src={linkIcon.src} />}
          {type == "file" && }
          {type == "help" && <img src={helpIcon.src} />}
          {type == "text" && <img src={textIcon.src} />} */}
          </div>
          {title}
        </div>
      </div>
    </Link>
  );
}

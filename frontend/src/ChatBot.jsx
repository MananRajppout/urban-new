"use client"
import { useEffect } from "react";

export default function ChatbotWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.defer = true;
    script.innerHTML = `
      import Chatbot from "https://cdn.n8nchatui.com/v1/embed.js";
      Chatbot.init({
        "n8nChatUrl": "https://mannanr.app.n8n.cloud/webhook/a889d2ae-2159-402f-b326-5f61e90f602e/chat",
        "metadata": {},
        "theme": {
          "button": {
            "backgroundColor": "#ad46ff",
            "right": 29,
            "bottom": 35,
            "size": 58,
            "iconColor": "#ffffff",
            "customIconSrc": "https://www.svgrepo.com/show/339963/chat-bot.svg",
            "customIconSize": 66,
            "customIconBorderRadius": 20,
            "autoWindowOpen": {
              "autoOpen": true,
              "openDelay": 2
            },
            "borderRadius": "circle"
          },
          "tooltip": {
            "showTooltip": true,
            "tooltipMessage": "Hello Ask me Anything About Video Desk",
            "tooltipBackgroundColor": "#fff9f6",
            "tooltipTextColor": "#1c1c1c",
            "tooltipFontSize": 14
          },
          "chatWindow": {
            "borderRadiusStyle": "rounded",
            "avatarBorderRadius": 25,
            "messageBorderRadius": 6,
            "showTitle": true,
            "title": "Videodesk Assistant",
            "titleAvatarSrc": "https://www.svgrepo.com/show/339963/chat-bot.svg",
            "avatarSize": 40,
            "welcomeMessage": "Hello! Hello I am your Videodesk Assistant.",
            "errorMessage": "Internal Server Error",
            "backgroundColor": "#ffffff",
            "height": 600,
            "width": 400,
            "fontSize": 16,
            "starterPrompts": [
              "How can i send video link",
              "How can i save screenshort"
            ],
            "starterPromptFontSize": 14,
            "renderHTML": false,
            "clearChatOnReload": false,
            "showScrollbar": false,
            "botMessage": {
              "backgroundColor": "#f36539",
              "textColor": "#fafafa",
              "showAvatar": true,
              "avatarSrc": "https://www.svgrepo.com/show/334455/bot.svg"
            },
            "userMessage": {
              "backgroundColor": "#fff6f3",
              "textColor": "#050505",
              "showAvatar": true,
              "avatarSrc": "https://www.svgrepo.com/show/532363/user-alt-1.svg"
            },
            "textInput": {
              "placeholder": "Type your query",
              "backgroundColor": "#ffffff",
              "textColor": "#1e1e1f",
              "sendButtonColor": "#f36539",
              "maxChars": 50,
              "maxCharsWarningMessage": "You exceeded the characters limit. Please input less than 50 characters.",
              "autoFocus": false,
              "borderRadius": 6,
              "sendButtonBorderRadius": 50
            }
          }
        }
      });
    `;
    document.body.appendChild(script);

    return () => {
      // Optional cleanup if component is ever unmounted
      document.body.removeChild(script);
    };
  }, []);

  return null;
}

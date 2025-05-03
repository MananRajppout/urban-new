var urbanChatServerUrl = "https://backend.urbanchat.ai";

var hostUrl = "https://urbanchat.ai";
// var hostUrl = "http://localhost:3000";

if (document.readyState === "complete") {
  onChatbotLoad();
} else {
  window.addEventListener("load", onChatbotLoad);
}

var urbanChatPopupVisible = true;

var urbanChatbotTheme = "light"

async function onChatbotLoad() {
  if (!urbanChatbotId) {
    alert("You have missed the script file, try copy again!");
    return;
  }

  let oldCss = document.getElementById("urban-chat-css");
  let oldDiv = document.getElementById("urban-chat-box");
  if (oldCss) document.body.removeChild(oldCss);
  if (oldDiv) document.body.removeChild(oldDiv);

  const baseCode = `
        <div id="urban-chat-pop-up" class="urban-chat-pop-up"><span id="urban-close-btn" class="urban-close-btn"><img src="${hostUrl}/close.svg"/></span></div>
        <iframe id="urban-chat-iframe" class="hide" src="${hostUrl}/chatbot-iframe/${urbanChatbotId}" title="description"></iframe>
        <button id="urban-toggle-btn">
            <img src="${hostUrl}/bot.svg" id="urban-chat-logo"/>
            <img src="${hostUrl}/arrow-dark.svg" class="hide" id="urban-chat-arrow"/>
        </button>
    `;

  const linkEle = document.createElement("link");
  linkEle.type = "text/css";
  linkEle.rel = "stylesheet";
  linkEle.id = "urban-chat-css";

  linkEle.href = hostUrl + "/integration/chatbot-integration.css";

  document.body.appendChild(linkEle);

  await sleep(1000);

  const res = await urbanChatFetchData(urbanChatbotId);

  if (!res) {
    console.log("Failed to load chatbot");
    return;
  }

  urbanChatbotTheme = res.botTheme;

  // check for allowed domain

  const host = location.hostname;

  try {
    const arr = JSON.parse(res.domain);

    if (arr.length > 0) {
      let isFound = false;
      for (const iterator of arr) {
        if (iterator.url.indexOf(host) != -1) {
          isFound = true;
          break;
        }
      }

      if (!isFound) {
        console.log("Not allowed on this domain");
        return;
      }
    }
  } catch (error) {
    console.log(
      "Data is not in correct format, please update it from domain section",
      error
    );
    return;
  }

  let urbanChatPopupMsg = [];

  function showUrbanPopUpMsg() {
    if (urbanChatPopupMsg.length == 0) return;
    const popupParent = document.querySelector("#urban-chat-pop-up");
    const p = document.createElement("p");
    const msg = urbanChatPopupMsg.shift();
    p.innerHTML = msg;

    p.addEventListener("click", toggleUrbanChatbot);

    popupParent?.appendChild(p);

    setTimeout(showUrbanPopUpMsg, 800);
  }

  setTimeout(() => {
    const msg = res.defaultMsg.split("\n");
    urbanChatPopupMsg = msg;

    showUrbanPopUpMsg();
  }, res.popupAfter * 1000);

  const div = document.createElement("div");
  div.className = "urban-chat-box";
  div.id = "urban-chat-box";

  if (res.align == "left") {
    div.className = "urban-chat-box left";
  }

  div.innerHTML = baseCode;
  document.body.appendChild(div);

  // const arrowImg = document.getElementById("urban-chat-arrow");
  // arrowImg.style.display = "none";

  const btn = document.querySelector("#urban-toggle-btn");
  btn.style.backgroundColor = res.backgroundColor;

  if (res.backgroundColor == "black") {
    const logoImg = document.getElementById("urban-chat-arrow");
    logoImg.src = hostUrl + "/arrow.svg";
  }

  const image = document.querySelector("#urban-toggle-btn img");
  btn.addEventListener("click", toggleUrbanChatbot);

  if (res.icon) image.src = res.icon;

  const span = document.querySelector("#urban-close-btn");
  span.addEventListener("click", () => {
    urbanChatPopupVisible = false;
    const popup = document.getElementById("urban-chat-pop-up");
    if (popup) {
      const parent = popup.parentElement;
      parent.removeChild(popup);
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function urbanChatFetchData(id) {
  // Replace this URL with the actual API endpoint
  const apiUrl = urbanChatServerUrl + "/api/fetch-chatbot?chat_model_id=" + id;

  try {
    // Make a GET request using Fetch and wait for the response
    const response = await fetch(apiUrl);

    // Check if the response status is OK (status code 200-299)
    if (response.ok) {
      const data = await response.json();
      return {
        popupAfter: data.view[0].auto_showing_initial_msg_in_seconds,
        defaultMsg: data.view[0].default_message,
        align: data.view[0].align_chat_bubble,
        icon: data.view[0].icon_or_popup,
        domain: data.view[0].allowed_domains,
        backgroundColor: data.view[0].bot_background_color
          ? data.view[0].bot_background_color
          : "white",
        botTheme: data.view[0].bot_theme,
      };
    } else {
      throw new Error("something went wrong");
    }
  } catch (error) {
    // Handle errors during the fetch
    console.error("Error during fetch:", error.message);
    return null;
  }
}

if (window.addEventListener) {
  window.addEventListener("message", onUrbanChatMessage, false);
} else if (window.attachEvent) {
  window.attachEvent("onmessage", onUrbanChatMessage, false);
}

function onUrbanChatMessage(event) {
  var data = event.data;

  if (typeof window[data.func] == "function") {
    window[data.func].call(null, data.message);
  }
}

var urbanChatbotVisible = false;

function toggleUrbanChatbot() {
  urbanChatPopupVisible = false;
  const popup = document.getElementById("urban-chat-pop-up");
  if (popup) {
    const parent = popup.parentElement;
    parent.removeChild(popup);
  }

  const width = window.innerWidth;

  urbanChatbotVisible = !urbanChatbotVisible;

  if (width < 650) {
    if (urbanChatbotVisible) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }

  if (urbanChatbotVisible) {
    // Chrome, Firefox OS and Opera
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = urbanChatbotTheme == "light" ? "white" : "black";
    meta.id = "urban-chat-theme-color";
    document.head.appendChild(meta);

    // windows phone
    const meta2 = document.createElement("meta");
    meta2.name = "msapplication-navbutton-color";
    meta2.content = urbanChatbotTheme == "light" ? "white" : "black";
    meta2.id = "urban-chat-theme-color-windows";
    document.head.appendChild(meta2);

    // iOS Safari
    const meta3 = document.createElement("meta");
    meta3.name = "apple-mobile-web-app-capable";
    meta3.content = "yes";
    meta3.id = "urban-chat-theme-color-ios";
    document.head.appendChild(meta3);

    const meta4 = document.createElement("meta");
    meta4.name = "apple-mobile-web-app-status-bar-style";
    meta4.content = urbanChatbotTheme == "light" ? "default" : "black";;
    meta4.id = "urban-chat-theme-color-ios-status";
    document.head.appendChild(meta4);
  } else {
    // remove
    const meta = document.getElementById("urban-chat-theme-color");
    if (meta) document.head.removeChild(meta);

    const meta2 = document.getElementById("urban-chat-theme-color-windows");
    if (meta2) document.head.removeChild(meta2);

    const meta3 = document.getElementById("urban-chat-theme-color-ios");
    if (meta3) document.head.removeChild(meta3);

    const meta4 = document.getElementById("urban-chat-theme-color-ios-status");
    if (meta4) document.head.removeChild(meta4);
  }

  const arrowImg = document.getElementById("urban-chat-arrow");
  arrowImg.classList.toggle("hide");
  const logoImg = document.getElementById("urban-chat-logo");
  logoImg.classList.toggle("hide");

  const iframe = document.getElementById("urban-chat-iframe");
  iframe.classList.toggle("hide");
  const btn = document.querySelector("#urban-toggle-btn");
  btn.classList.toggle("hide-chat");
}

import React, { useContext, useEffect, useRef, useState } from "react";

import logo2 from "@/assets/default_icon.png";
import chatLight from "@/assets/chat-icon-light.svg";
import chatDark from "@/assets/chat-icon-dark.svg";
import robot from "@/assets/Icons/bot.png";

import { toast } from "react-hot-toast";
import { updateChatbotById } from "@/lib/api/ApiUpdateChatbot";
import { ServerDataContext } from "@/pages/my-chatbot/update/[id]";
import ChatBox from "../../ChatBox";
import useAutosizeTextArea from "@/hooks/useAutoSizeTextarea";
import ChooseFile from "../../Widget/ChooseFile";
import ColorPickDialog from "../../Dialog/ColorPickDialog";
import { useRouter } from "next/router";
import Toggle from "@/components/Widget/Toggle";

export default function ChatInterface() {
  const { serverData, setServerData, userDetail } =
    useContext(ServerDataContext);

  const router = useRouter();
  const { id } = router.query;

  const [theme, setTheme] = useState("light");
  const [messageColor, setMessageColor] = useState("var(--color-primary)");
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("light");
  const [bubbleDir, setBubbleDir] = useState("left");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoMessageTime, setAutoMessageTime] = useState(1);

  const [initialMsg, setInitialMsg] = useState([]);
  const [suggestedMsg, setSuggestedMsg] = useState([]);
  const [chatbotIcon, setChatbotIcon] = useState("");
  const [chatbotTitle, setChatbotTitle] = useState("");

  const [leadTitle, setLeadTitle] = useState("");
  const [acceptLead, setAcceptLead] = useState(false);

  const textAreaRef1 = useRef(null);
  const [textValue1, setTextValue1] = useState("");
  const [textValue2, setTextValue2] = useState("");
  const textAreaRef2 = useRef(null);
  const [isPowered, setIsPowered] = useState(true);

  const [isPoweredByRemovable, setIsPoweredByRemovable] = useState(false);

  useEffect(() => {
    if (!userDetail) return;

    const plan = userDetail.data.current_plan.name;

    if (plan == "Free" || plan == "Hobby") return;
    setIsPoweredByRemovable(true);
  }, [userDetail]);

  useAutosizeTextArea(textAreaRef1.current, textValue1);
  useAutosizeTextArea(textAreaRef2.current, textValue2);

  const formData = useRef({
    align_chat_bubble: "",
    bot_picture: "",
    bot_theme: "",
    bot_title: "",
    name: "",
    default_message: "",
    bot_background_color: "",
    bot_font_color: "",
    auto_showing_initial_msg_in_seconds: 1,
    suggested_messages: "",
    icon_or_popup: "",
    remove_powered_by: false,
  });

  function changeTheme(name) {
    setTheme(name);
    formData.current.bot_theme = name;
  }

  function changeMessageColor(name) {
    setMessageColor(name);
    formData.current.bot_font_color = name;
  }

  function changeBackgroundColor(name) {
    setBackgroundColor(name);
    formData.current.bot_background_color = name;
  }

  function changeBubbleDir(direction) {
    setBubbleDir(direction);
    formData.current.align_chat_bubble = direction;
  }

  function changeAutoMsgTime(time) {
    setAutoMessageTime(time);
    formData.current.auto_showing_initial_msg_in_seconds = time;
  }

  function changePowerBy(value) {
    formData.current.remove_powered_by = value;
    setIsPowered(value);
  }

  async function onSave() {
    if (isSaving) return;
    const data = structuredClone(formData.current);

    // filter
    if (data.name == serverData.view[0].name) delete data.name;
    if (data.bot_picture == serverData.view[0].bot_picture)
      delete data.bot_picture;
    if (data.icon_or_popup == serverData.view[0].icon_or_popup)
      delete data.icon_or_popup;
    if (data.bot_theme == serverData.view[0].bot_theme) delete data.bot_theme;
    if (data.bot_title == serverData.view[0].bot_title) delete data.bot_title;
    if (data.default_message == serverData.view[0].default_message)
      delete data.default_message;
    if (data.suggested_messages == serverData.view[0].suggested_messages)
      delete data.suggested_messages;
    if (data.align_chat_bubble == serverData.view[0].align_chat_bubble)
      delete data.align_chat_bubble;

    if (data.bot_background_color == serverData.view[0].bot_background_color)
      delete data.bot_background_color;
    if (data.bot_font_color == serverData.view[0].bot_font_color)
      delete data.bot_font_color;
    if (
      data.auto_showing_initial_msg_in_seconds ==
      serverData.view[0].auto_showing_initial_msg_in_seconds
    )
      delete data.auto_showing_initial_msg_in_seconds;

    if (data.remove_powered_by == serverData.view[0].remove_powered_by)
      delete data.remove_powered_by;
    // do more ...

    if (Object.keys(data).length == 0) {
      toast.error("Please update something first");
      return;
    }

    setIsSaving(true);
    const res = await updateChatbotById(id, data);
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        if (data.name) raw.view[0].name = data.name;
        if (data.bot_picture) raw.view[0].bot_picture = data.bot_picture;
        if (data.icon_or_popup) raw.view[0].icon_or_popup = data.icon_or_popup;
        if (data.bot_theme) raw.view[0].bot_theme = data.bot_theme;
        if (data.bot_title) raw.view[0].bot_title = data.bot_title;
        if (data.default_message)
          raw.view[0].default_message = data.default_message;
        if (data.suggested_messages)
          raw.view[0].suggested_messages = data.suggested_messages;
        if (data.align_chat_bubble)
          raw.view[0].align_chat_bubble = data.align_chat_bubble;
        if (data.bot_background_color)
          raw.view[0].bot_background_color = data.bot_background_color;
        if (data.bot_font_color)
          raw.view[0].bot_font_color = data.bot_font_color;
        if (data.auto_showing_initial_msg_in_seconds)
          raw.view[0].auto_showing_initial_msg_in_seconds =
            data.auto_showing_initial_msg_in_seconds;

        if (data.remove_powered_by)
          raw.view[0].remove_powered_by = data.remove_powered_by;

        return raw;
      });

      if (data.default_message)
        setInitialMsg(data.default_message.split("\n").filter((item) => item));
      if (data.suggested_messages)
        setSuggestedMsg(
          data.suggested_messages.split("\n").filter((item) => item)
        );
      if (data.bot_picture) setChatbotIcon(data.bot_picture);
      if (data.name) setChatbotTitle(data.name);

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  useEffect(() => {
    // set state
    formData.current.default_message = serverData.view[0].default_message;
    formData.current.bot_title = serverData.view[0].bot_title;
    formData.current.bot_theme = serverData.view[0].bot_theme;
    formData.current.align_chat_bubble = serverData.view[0].align_chat_bubble;
    formData.current.bot_picture = serverData.view[0].bot_picture;
    formData.current.icon_or_popup = serverData.view[0].icon_or_popup;
    formData.current.name = serverData.view[0].name;
    formData.current.bot_background_color =
      serverData.view[0].bot_background_color;
    formData.current.bot_font_color = serverData.view[0].bot_font_color;
    formData.current.auto_showing_initial_msg_in_seconds =
      serverData.view[0].auto_showing_initial_msg_in_seconds;
    formData.current.suggested_messages = serverData.view[0].suggested_messages;
    formData.current.remove_powered_by = serverData.view[0].remove_powered_by;

    // update
    setTheme(serverData.view[0].bot_theme);
    setBubbleDir(serverData.view[0].align_chat_bubble);
    setMessageColor(serverData.view[0].bot_font_color);
    setBackgroundColor(serverData.view[0].bot_background_color);
    setAutoMessageTime(serverData.view[0].auto_showing_initial_msg_in_seconds);

    setInitialMsg(
      serverData.view[0].default_message.split("\n").filter((item) => item)
    );
    setSuggestedMsg(
      serverData.view[0].suggested_messages.split("\n").filter((item) => item)
    );
    setProfileIcon(serverData.view[0].bot_picture);
    setBotIcon(serverData.view[0].icon_or_popup);
    setChatbotIcon(serverData.view[0].bot_picture);
    setChatbotTitle(serverData.view[0].name);

    setAcceptLead(serverData.view[0].accept_leads);
    setLeadTitle(serverData.view[0].leads_title);

    setIsLoaded(true);
  }, []);

  const [profileIcon, setProfileIcon] = useState("");
  function onProfileIconSelect(file = "") {
    formData.current.bot_picture = file;
    setProfileIcon(file);
    setChatbotIcon(file);
  }

  const [botIcon, setBotIcon] = useState("");
  function onBotIconSelect(file = "") {
    formData.current.icon_or_popup = file;
    setBotIcon(file);
  }

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=model`);
  }

  return (
    <div className="main-col-2">
      <div>
        <h2>Chat Interface</h2>

        <p className="input-title">Display Name</p>
        <input
          defaultValue={serverData.view[0].name}
          type="text"
          onChange={(e) => {
            formData.current.name = e.target.value;
            setChatbotTitle(e.target.value);
          }}
          placeholder="Display name"
        />

        <p className="input-title">Profile Picture</p>
        <div className="choose-file">
          <ChooseFile onFileSelect={onProfileIconSelect} />
          <img src={profileIcon ? profileIcon : logo2.src} />
          {/* <img src={profileIcon.src} /> */}
        </div>

        <p className="input-title">Initial Messages</p>
        <textarea
          ref={textAreaRef1}
          defaultValue={serverData.view[0].default_message}
          onChange={(e) => {
            const temp = e.target.value;
            if (!temp) return;
            formData.current.default_message = e.target.value;
            const tempData = temp.split("\n").filter((item) => item);
            setTextValue1(temp);
            setInitialMsg(tempData);
            setInitialMsg(tempData);
          }}
          placeholder="message"
        ></textarea>
        <p className="note">Enter each message in a new line.</p>

        <p className="input-title">Suggested Messages</p>
        <textarea
          defaultValue={serverData.view[0].suggested_messages}
          onChange={(e) => {
            setTextValue2(e.target.value);
            setSuggestedMsg(e.target.value.split("\n").filter((item) => item));
            formData.current.suggested_messages = e.target.value;
          }}
          ref={textAreaRef2}
          placeholder="message"
        ></textarea>
        <p className="note">Enter each message in a new line.</p>

        <p className="input-title">Theme</p>
        <div className="chip-holder">
          <div
            onClick={() => changeTheme("light")}
            className={theme == "light" ? "chip active" : "chip"}
          >
            <span className="circle"></span>
            <span className="responsive-hide">Light Mode</span>
          </div>

          <div
            onClick={() => changeTheme("dark")}
            className={theme == "dark" ? "chip active" : "chip"}
          >
            <span className="circle black"></span>
            <span className="responsive-hide">Dark Mode</span>
          </div>
        </div>

        <p className="input-title">User Message Color</p>
        <div className="chip-holder">
          <div
            onClick={() => changeMessageColor("var(--color-primary)")}
            className={
              messageColor == "var(--color-primary)" ? "chip active" : "chip"
            }
          >
            <span className="circle green"></span>
            <span className="responsive-hide">Default</span>
          </div>

          <div
            onClick={() => setIsColorDialogOpen(true)}
            className={
              messageColor != "var(--color-primary)" ? "chip active" : "chip"
            }
          >
            <span
              className="circle"
              style={{ backgroundColor: messageColor }}
            ></span>
            <span className="responsive-hide">Custom</span>
          </div>
        </div>

        <div className="note-box">
          <span>Note</span>
          <p>
            If the changes here don't show up immediately on your website try
            clearing your browser cache or use incognito. ( New users will see
            the changes immediately )
          </p>
        </div>

        <h3>Icon and Popup Animation</h3>
        <p className="input-title">Chatbot Icon</p>
        <div className="choose-file">
          <ChooseFile onFileSelect={onBotIconSelect} />
          <img
            src={
              botIcon
                ? botIcon
                : backgroundColor == "black"
                ? chatDark.src
                : chatLight.src
            }
          />
        </div>

        <p className="input-title">Background Color</p>
        <div className="chip-holder">
          <div
            onClick={() => changeBackgroundColor("white")}
            className={backgroundColor == "white" ? "chip active" : "chip"}
          >
            <span className="circle"></span>
            <span className="responsive-hide">White Color</span>
          </div>

          <div
            onClick={() => changeBackgroundColor("black")}
            className={backgroundColor == "black" ? "chip active" : "chip"}
          >
            <span className="circle black"></span>
            <span className="responsive-hide"> Black Color</span>
          </div>
        </div>

        <p className="input-title">Align Chat Bubble Button</p>
        <div className="chip-holder">
          <div
            onClick={() => changeBubbleDir("right")}
            className={bubbleDir == "right" ? "chip active" : "chip"}
          >
            Right Side
          </div>

          <div
            onClick={() => changeBubbleDir("left")}
            className={bubbleDir == "left" ? "chip active" : "chip"}
          >
            Left Side
          </div>
        </div>

        <p className="input-title">
          Auto show initial messages pop-ups after Seconds
        </p>
        <div className="paginate">
          {[1, 2, 3, 4, 5, 6].map((value, index) => (
            <span
              key={index}
              className={autoMessageTime == value ? "active" : ""}
              onClick={() => changeAutoMsgTime(value)}
            >
              0{value}
            </span>
          ))}
        </div>

        <br />
        <div className="water-mark">
          <h3>Remove Watermark</h3>
          <Toggle
            isOn={serverData.view[0].remove_powered_by}
            onToggle={changePowerBy}
            disabled={!isPoweredByRemovable}
          />
        </div>
        <div className="note-box">
          <span>Note</span>
          <p>
            Remove watermark is only available in{" "}
            <u>
              <i>Standard</i>
            </u>{" "}
            and{" "}
            <u>
              <i>Unlimited</i>
            </u>{" "}
            plans
          </p>
        </div>
      </div>

      <div className="chat-interface-right">
        <div className="rounded-bot sticky-bot">
          {/* content missing */}
          <ChatBox
            isTest={true}
            chatbotId={id}
            title={chatbotTitle}
            icon={chatbotIcon}
            isSmall={true}
            initialMsg={initialMsg}
            isDark={theme == "light" ? false : true}
            suggestedMsg={suggestedMsg}
            leadTitle={leadTitle}
            acceptLead={acceptLead}
            userMsgColor={messageColor}
            isPowered={isPowered}
          />

          <div className="button-holder">
            <button onClick={onSave} className="primary">
              {isSaving ? (
                <span className="loading mini"></span>
              ) : (
                "Save & Next"
              )}
            </button>
          </div>
        </div>
      </div>

      <ColorPickDialog
        isDialogOpen={isColorDialogOpen}
        onColorPick={(color) => {
          formData.current.bot_font_color = color;
          setMessageColor(color);
        }}
        onDialogClose={() => setIsColorDialogOpen(false)}
      />
    </div>
  );
}

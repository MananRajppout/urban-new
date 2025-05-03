import React, { useEffect, useRef, useState } from "react";

import "../styles/chat-box.css";
import logo from "../assets/logo2.png";
import toast from "react-hot-toast";
import { createLead } from "../lib/api/ApiUpdateChatbot";
import useAutosizeTextArea from "@/hooks/useAutoSizeTextarea";
import CloseIcon from "./icons/CloseIcon";
import ResetIcon from "./icons/ResetIcon";
import SendIcon from "./icons/SendIcon";
import Markdown, { MarkdownToJSX, RuleType } from "markdown-to-jsx";
import { v4 as uuidv4 } from "uuid";
import closeDarkIcon from "@/assets/Icons/close-dark.svg";
import closeLightIcon from "@/assets/Icons/close-light.svg";
import resetDarkIcon from "@/assets/Icons/reset-dark.svg";
import resetLightIcon from "@/assets/Icons/reset-light.svg";
import ArrowIcon from "./icons/ArrowIcon";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  bookMeeting,
  getMeetingSlots,
  getMeetingType,
} from "@/lib/api/ApiExtra";
import {
  getDateString,
  getStartAndEndOfMonth,
  getTimeString,
  isValidEmail,
  timestampToCustomFormat,
  timestampToDate,
} from "@/Utils";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function ChatBox({
  chatbotId = "",
  autoInitialMsgAfter = 3,
  msgCoolDownTime = 1,
  maxMsgAllow = 5,
  isActive = true,
  isPowered = true,
  isTest = false,
  title = "",
  icon = "",
  isSmall = false,
  suggestedMsg = [],
  initialMsg = [],
  isDark = true,
  userMsgColor,
  leadTitle,
  acceptLead,
  skipLimit = false,
  cacheHistory = true,
  acceptName = false,
  acceptPhone = false,
  acceptEmail = false,
  limitReachMsg = "",
  isPrivate = false,
  calendlyUsername = "",
}) {
  const [isLeads, setIsLeads] = useState("close"); // open | close | off
  // type : user | bot | loading
  const [message, setMessage] = useState([]);
  let botMsgCount = useRef([]);
  let isCoolDown = useRef(false);
  const inputBox = useRef();
  const [isProgress, setIsProgress] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(uuidv4());

  const [mode, setMode] = useState("chatting"); // chatting | booking
  const [bookingTab, setBookingTab] = useState(0);

  useAutosizeTextArea(inputBox.current, inputValue);

  function isAcceptLeadPossible() {
    return acceptName || acceptEmail || acceptPhone;
  }

  function getCurrentTime() {
    return new Date().getTime();
  }

  function loadChatHistory() {
    if (isTest || !cacheHistory) return [];

    const item2 = localStorage.getItem("urban_chat_count-" + chatbotId);
    if (item2) {
      const arr = JSON.parse(item2);
      const oneDaysBeforeTime = getCurrentTime() - 1 * 24 * 60 * 60 * 1000; // - 1 days time
      const todayCount = arr.filter((time) => time > oneDaysBeforeTime);
      botMsgCount.current = todayCount;
    }

    const item = localStorage.getItem("urban_chat_history-" + chatbotId);
    if (item) {
      const arr = JSON.parse(item);
      const fiveDaysBeforeTime = getCurrentTime() - 5 * 24 * 60 * 60 * 1000; // - 5 days time
      const filterChat = arr.filter((item) => item.time > fiveDaysBeforeTime);

      saveChatHistory(filterChat);
      return filterChat;
    }

    return [];
  }

  function saveChatHistory(chats) {
    if (isTest || !cacheHistory) return;

    if (isTest) return;
    let json = JSON.stringify(chats);
    localStorage.setItem("urban_chat_history-" + chatbotId, json);

    let json2 = JSON.stringify(botMsgCount.current);
    localStorage.setItem("urban_chat_count-" + chatbotId, json2);
  }

  function isLeadAccepted() {
    const item = localStorage.getItem("urban_chat_history-lead-" + chatbotId);

    return item ? true : false;
  }

  function setLeadAccepted(value = true) {
    localStorage.setItem("urban_chat_history-lead-" + chatbotId, value);
  }

  useEffect(() => {
    // console.log({ acceptLead })
    if (isTest) setIsLeads(acceptLead);
  }, [acceptLead]);

  useEffect(() => {
    if (isTest) {
      showInitialMsg();
      return;
    }

    if (isTest) setIsLeads(acceptLead);
    const history = loadChatHistory();
    setMessage(history);

    const timer2 = setTimeout(scrollToBottom, 1000);

    if (history.length == 0) {
      const timer = setTimeout(showInitialMsg, autoInitialMsgAfter * 1000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }

    isCoolDown.current = true;

    return () => {
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  function showInitialMsg() {
    const tempMsg = initialMsg.map((item) => {
      return { message: item, type: "assistant", time: getCurrentTime() };
    });
    if (isTest) {
      tempMsg.push({
        message: "I am fine, whats about you?",
        type: "user",
        time: getCurrentTime(),
      });
    }
    setMessage(tempMsg);
    isCoolDown.current = true;
  }

  //   used in test mode only
  useEffect(() => {
    if (!initialMsg.length) return;
    if (!isTest) return;
    // setMessage(
    //   initialMsg.map((item) => {
    //     return { message: item, type: "assistant", time: getCurrentTime() };
    //   })
    // );
    showInitialMsg();
  }, [initialMsg]);

  // useEffect(() => {
  //   console.log({ initialMsg });
  // } , [initialMsg])

  function onClean() {
    if (!initialMsg) return;
    saveChatHistory([]);
    setMessage(
      initialMsg.map((item) => {
        return { message: item, type: "assistant", time: getCurrentTime() };
      })
    );
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function onSubmit(event) {
    event.preventDefault();

    let value = inputValue.trim();
    if (value) {
      sendMsg(value);
    }
    setInputValue("");
  }

  // readChunks() reads from the provided reader and yields the results into an async iterable
  function readChunks(reader) {
    return {
      async *[Symbol.asyncIterator]() {
        let readResult = await reader.read();
        while (!readResult.done) {
          yield readResult.value;
          readResult = await reader.read();
        }
      },
    };
  }

  const scrollEle = useRef();
  const scrollToBottom = () => {
    scrollEle.current.scrollTop = scrollEle.current.scrollHeight;
  };

  async function sendMsg(text) {
    if (isTest) {
      toast.error("Msg not allowed in test mode");
      return;
    }
    if (!isCoolDown.current || isProgress) {
      return;
    }

    if (skipLimit == false && maxMsgAllow > 0) {
      if (maxMsgAllow <= botMsgCount.current.length) {
        console.log("Today limit reached");
        if (limitReachMsg) {
          setMessage((old) => [
            ...old,
            {
              message: limitReachMsg,
              type: "assistant",
              time: getCurrentTime(),
            },
          ]);
        }
        return;
      }
    }

    setIsProgress(true);
    isCoolDown.current = false;
    setTimeout(() => (isCoolDown.current = true), msgCoolDownTime * 1000);

    const oldMsg = [
      ...message.map((item) => {
        return { content: item.message, role: item.type };
      }),
      { content: text, role: "user" },
    ];

    const data = {
      chatbot_id: chatbotId,
      messages: oldMsg,
      chat_session_id: sessionId,
    };
    setMessage((old) => [
      ...old,
      { message: text, type: "user", time: getCurrentTime() },
      { message: "", type: "loading" },
    ]);

    fetch(serverUrl + "/api/chat-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const time = getCurrentTime();

        setMessage((old) => {
          const copy = old.slice();
          copy.pop();
          copy.push({ message: "", type: "assistant", time: time });
          return copy;
        });

        const reader = response.body.getReader();
        const textDecoder = new TextDecoder("utf-8");

        for await (const chunk of readChunks(reader)) {
          const resultString = textDecoder.decode(chunk);

          setMessage((old) => {
            const copy = old.slice();
            const oldMsg = copy[copy.length - 1].message;
            let newMsg = oldMsg + resultString;

            // check for booking keyword
            const searchStr = "book_meeting";
            const index = newMsg.indexOf(searchStr);
            if (index != -1) {
              const startMsg = newMsg.substring(0, index);
              const endMsg = newMsg.substring(index + searchStr.length);
              newMsg = startMsg + endMsg;

              if (calendlyUsername) {
                setMode("booking");
              } else {
                console.log("Form skipped due to missing calendly username!");
              }
            }

            copy[copy.length - 1] = {
              message: newMsg,
              type: "assistant",
              time: time,
            };
            return copy;
          });
        }

        botMsgCount.current.push(getCurrentTime());
        setMessage((old) => {
          saveChatHistory(old);
          return old;
        });

        if (acceptLead) {
          if (isLeadAccepted() == false && isLeads == "close") {
            setIsLeads("open");
          }
        }
        scrollToBottom();

        setIsProgress(false);
      })
      .catch((error) => {
        console.error("Error during fetch:", error);
        setIsProgress(false);
        // Handle the error here, for example, update the UI or log the error.

        setMessage((old) => {
          const copy = old.slice();
          copy.pop();
          return copy;
        });
      });
  }

  function writeMsg(msg) {
    const time = getCurrentTime();
    console.log({ msg });
    setMessage((old) => {
      const clone = [...old, { message: msg, type: "assistant", time }];
      saveChatHistory(clone);
      return clone;
    });
  }

  function onClose() {
    window.parent.postMessage(
      {
        func: "toggleUrbanChatbot",
        message: "Message text from iframe.",
      },
      "*"
    );
  }

  async function onLeadSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const res = await createLead(chatbotId, email, name, phone, sessionId);
    if (res.data) {
      setLeadAccepted(true);
      setIsLeads("off");
      return;
    }
  }

  function onKeyDown(event) {
    if (event.key === "Enter" && event.shiftKey == false) {
      event.preventDefault();
      onSubmit(event);
    }
  }

  const options = {
    renderRule(next, node, renderChildren, state) {
      //  if (node.type === RuleType.codeBlock && node.lang === 'latex') {
      //    return (
      //     <TeX as="div" key={state.key}>
      //       {String.raw`${node.text}`}
      //     </TeX>
      //    )
      // }
      // console.log({ node, state });

      if (node.type === RuleType.link) {
        return (
          <a key={state.key} target="_blank" href={node.target}>
            {renderChildren(node.children)}
          </a>
        );
      }

      return next();
    },
  };

  const [selected, setSelected] = useState(); // store date object

  const [isMeetingTypeLoading, setIsMeetingTypeLoading] = useState(false);
  const [meetingType, setMeetingType] = useState([]);

  const [meetingFormData, setMeetingFormData] = useState({
    name: "",
    email: "",
    meetingUuid: "",
    meetingTime: "",
  });

  /** structure
  {
    "name": "60 min",
    "slug": "60-min",
    "uuid": "81307a9d-248c-4df9-b44e-6bfa662642eb",
    "selected" : false
  }
   */

  async function loadMeetingType() {
    if (isMeetingTypeLoading) return;
    setIsMeetingTypeLoading(true);

    // TODO: add username here
    const res = await getMeetingType(calendlyUsername);
    if (res.data) {
      const data = res.data.data.map((item) => {
        return {
          name: item.name,
          slug: item.slug,
          uuid: item.uuid,
          selected: false,
        };
      });
      setMeetingType(data);
    } else {
      // toast.error("Failed to load meeting, plz try again after sometime!");
      console.log(res.message);
    }

    setIsMeetingTypeLoading(false);
  }

  useEffect(() => {
    if (mode == "booking") {
      loadMeetingType();
    }
  }, [mode]);

  function onMeetingTypeSelect(meetingUuid) {
    const item = meetingType.find((item) => item.uuid == meetingUuid);
    if (!item) return;

    setMeetingFormData({ ...meetingFormData, meetingUuid: meetingUuid });

    const data = meetingType.map((item) => {
      if (item.uuid == meetingUuid) {
        return { ...item, selected: true };
      } else {
        return { ...item, selected: false };
      }
    });

    setMeetingType(data);
  }

  function onNameChange(name) {
    setMeetingFormData({ ...meetingFormData, name: name });
  }

  function onEmailChange(email) {
    setMeetingFormData({ ...meetingFormData, email: email });
  }

  function onBookingTabChange(tab) {
    if (isBooking) return;
    if (tab == 1) {
      if (
        meetingFormData.name == "" ||
        meetingFormData.email == "" ||
        meetingFormData.meetingUuid == ""
      ) {
        toast.error("Please fill all the details!");
        return;
      }

      if (!isValidEmail(meetingFormData.email)) {
        toast.error("Please enter a valid email!");
        return;
      }
    } else if (tab == 2) {
      if (!selected) {
        toast.error("Please select a date!");
        return;
      }
    }
    setBookingTab(tab);
  }

  function onMonthChange(date) {
    const { startDate, endDate } = getStartAndEndOfMonth(date);
    loadAvailableSlots(getDateString(startDate), getDateString(endDate));
  }

  useEffect(() => {
    if (bookingTab == 1) {
      onMonthChange(new Date());
    }
  }, [bookingTab]);

  useEffect(() => {
    console.log({ selected });
  }, [selected]);

  const [availableSlots, setAvailableSlots] = useState({
    availability_timezone: "",
    days: [],
  });

  /* struct - > days
      {
      "date": "2024-05-01",
      "status": "available",
      "spots": [{
          "status": "available",
          "start_time": "2024-05-17T20:00:00+05:30",
          "invitees_remaining": 1
      }],
      "invitee_events": []
    }
   */

  function getUnavailableDates() {
    return availableSlots.days
      .filter((item) => item.status == "unavailable")
      .map((item) => new Date(item.date));
  }

  function getDateAllTime() {
    const date = getDateString(selected);
    console.log({ date, selected });
    const dateObj = availableSlots.days.find((item) => item.date == date);
    if (!dateObj) return [];
    return dateObj.spots
      .filter((item) => item.status == "available")
      .map((item) => item.start_time);
  }

  async function loadAvailableSlots(startDate, endDate) {
    const res = await getMeetingSlots(
      meetingFormData.meetingUuid,
      startDate,
      endDate
    );

    if (res.data) {
      setAvailableSlots(res.data.data);
    } else {
      console.log(res.message);
    }
  }

  function onBookingTimeChange(time) {
    setMeetingFormData({ ...meetingFormData, meetingTime: time });
  }

  const [isBooking, setIsBooking] = useState(false);

  async function onBook() {
    if (isBooking) return;
    if (meetingFormData.meetingTime == "") {
      toast.error("Please select a time first!");
      return;
    }

    setIsBooking(true);
    const res = await bookMeeting(
      meetingFormData.meetingTime,
      meetingFormData.name,
      meetingFormData.email,
      meetingFormData.meetingUuid,
      chatbotId,
      availableSlots.availability_timezone
    );

    setIsBooking(false);

    if (res.data) {
      closeBooking(
        `Your appointment has been scheduled for ${timestampToDate(
          meetingFormData.meetingTime
        )}`
      );
    } else {
      console.log(res.message);
      closeBooking("Failed to book meeting, please try again after sometime!");
    }
  }

  function closeBooking(msg = "") {
    setMode("chatting");
    setBookingTab(0);
    setMeetingFormData({
      name: "",
      email: "",
      meetingUuid: "",
      meetingTime: "",
    });

    if (msg) {
      writeMsg(msg);
    }
  }

  return (
    <div className="chat-box-main">
      <div
        className={
          (isDark ? "chat-box" : "chat-box light") + (isSmall ? " small" : "")
        }
      >
        <div className="header">
          <div>
            {icon && <img className="logo" src={icon ? icon : logo} />}
            <span>{title ? title : ""}</span>
          </div>
          <div>
            <button onClick={onClean} className="hover rotate">
              {isDark ? (
                <img src={resetLightIcon.src} alt="reset" />
              ) : (
                <img src={resetDarkIcon.src} alt="reset" />
              )}
            </button>
            <button onClick={onClose} className="hover">
              {isDark ? (
                <img src={closeLightIcon.src} alt="close" />
              ) : (
                <img src={closeDarkIcon.src} alt="close" />
              )}
            </button>
          </div>
        </div>
        <hr />
        <div ref={scrollEle} className="box-content">
          {message.map((value, index) => {
            if (value.type == "user") {
              return (
                <div key={index} className="chat primary">
                  <p style={{ backgroundColor: userMsgColor }}>
                    {value.message}
                  </p>
                </div>
              );
            } else if (value.type == "assistant") {
              return (
                <div key={index} className="chat">
                  <div>
                    <Markdown options={options}>{value.message}</Markdown>
                  </div>
                  {/* <SlowTypeText text={value.message} /> */}
                </div>
              );
            } else {
              return (
                <div key={index} className="chat">
                  <div>
                    <div className="progress-load">
                      <div className="item"></div>
                      <div className="item"></div>
                      <div className="item"></div>
                    </div>
                  </div>
                </div>
              );
            }
          })}

          {isLeads == "open" && isAcceptLeadPossible() && (
            <div className="chat lead">
              <div className="title">
                <p>{leadTitle}</p>
                <svg
                  onClick={() => setIsLeads("off")}
                  className="hover"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 17 16"
                  fill="none"
                >
                  <path
                    d="M4.83008 12L12.8301 4M4.83008 4L12.8301 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <form
                autoComplete="off"
                className="input-div"
                onSubmit={onLeadSubmit}
              >
                {acceptName && (
                  <div>
                    <span>Name</span>
                    <input name="name" required type="text" />
                  </div>
                )}
                {acceptEmail && (
                  <div>
                    <span>Email</span>
                    <input name="email" required type="email" />
                  </div>
                )}
                {acceptPhone && (
                  <div>
                    <span>Phone</span>
                    <input name="phone" required type="text" />
                  </div>
                )}
                <button type="submit">
                  <SendIcon />
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="chat-footer">
          {(isActive || isPrivate) && (
            <>
              <div className="default">
                {suggestedMsg.map((item, index) => (
                  <button
                    key={index}
                    className="hover"
                    onClick={() => sendMsg(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <form autoComplete="off" onSubmit={onSubmit}>
                <input
                  onKeyDown={onKeyDown}
                  onChange={(e) => setInputValue(e.target.value)}
                  value={inputValue}
                  ref={inputBox}
                  name="msg"
                  placeholder="Write here..."
                />

                <button type="submit" className="hover">
                  <SendIcon />
                </button>
              </form>
            </>
          )}

          {isPowered ? (
            <p className="power">
              Powered by{" "}
              <a target="_blank" href="https://urbanchat.ai">
                UrbanChat
              </a>
            </p>
          ) : (
            <br />
          )}
        </div>
      </div>

      {/* booking */}
      {mode == "booking" && (
        <div className="booking">
          <div className="header">
            <button onClick={() => closeBooking()} className="hover">
              <ArrowIcon />
            </button>
            <span>Booking Meet</span>
          </div>
          <div className="body-area thin">
            <div className="inner">
              {/* first tab */}
              {bookingTab == 0 && (
                <>
                  <h4>Basic Details</h4>
                  <div className="input-area">
                    <span>Name</span>
                    <input
                      type="text"
                      value={meetingFormData.name}
                      onChange={(e) => onNameChange(e.target.value)}
                      placeholder="e.g Tony stark"
                    />
                  </div>
                  <div className="input-area">
                    <span>Email</span>
                    <input
                      type="email"
                      value={meetingFormData.email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="e.g tonystark@gmail.com"
                    />
                  </div>

                  <h4>Choose meeting type</h4>
                  <div className="meeting-type">
                    {isMeetingTypeLoading ? (
                      <div>Loading...</div>
                    ) : meetingType.length == 0 ? (
                      <div className="no-time-slot">
                        No meeting type available!
                      </div>
                    ) : (
                      meetingType.map((item, index) => (
                        <span
                          className={item.selected ? "active" : ""}
                          onClick={() => onMeetingTypeSelect(item.uuid)}
                          key={index}
                        >
                          {item.name}
                        </span>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* second tab */}
              {bookingTab == 1 && (
                <>
                  <h4>Choose Date of Meeting</h4>
                  <DayPicker
                    fromDate={new Date()}
                    disabled={[{ dayOfWeek: [0] }, ...getUnavailableDates()]}
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    onMonthChange={onMonthChange}
                  />
                </>
              )}

              {/* third tab */}
              {bookingTab == 2 && (
                <>
                  <h4>Choose Time of Meeting</h4>
                  {getDateAllTime().length == 0 ? (
                    <div className="no-time-slot">
                      No time slot available on this date!
                    </div>
                  ) : (
                    <div className="time-picker">
                      {getDateAllTime().map((item, index) => (
                        <button
                          className={
                            item == meetingFormData.meetingTime ? "active" : ""
                          }
                          onClick={(e) =>
                            onBookingTimeChange(e.target.dataset.value)
                          }
                          data-value={item}
                          key={index}
                        >
                          {getTimeString(item)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="action-area">
            <button
              disabled={bookingTab == 0}
              className="outline hover"
              onClick={() => onBookingTabChange(bookingTab - 1)}
            >
              Previous
            </button>
            <button
              disabled={bookingTab == 2}
              onClick={() => onBookingTabChange(bookingTab + 1)}
              className="primary hover"
            >
              Next
            </button>
            <button
              disabled={bookingTab < 2}
              onClick={onBook}
              className="primary hover"
            >
              {isBooking && <span className="loading mini"></span>} Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

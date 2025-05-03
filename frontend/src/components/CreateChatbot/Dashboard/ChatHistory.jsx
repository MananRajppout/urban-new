import React, { useEffect, useRef, useState } from "react";
import removeMd from "remove-markdown";

import Dropdown from "../../Widget/Dropdown";
import { fetchChatbotHistory } from "@/lib/api/ApiUpdateChatbot";

import toast from "react-hot-toast";
import { getFormattedDate, getIsoTime, getDateAfter } from "@/Utils";
import { useRouter } from "next/router";
import {
  downloadChatHistory,
  getChatSessionHistory,
} from "@/lib/api/ApiChatbot";
import DateRangePicker from "@/components/Widget/DateRangePicker";
import js_ago from "js-ago";
import Markdown from "markdown-to-jsx";
import DownloadIcon from "@/components/icons/DownloadIcon";
import { useRole } from "@/hooks/useRole";

const confidenceScore = [
  {
    name: "Less than 1",
    value: "1.001",
  },
  {
    name: "Less than 0.5",
    value: "0.5",
  },
  {
    name: "Less than 0.3",
    value: "0.3",
  },
  {
    name: "Less than 0.1",
    value: "0.1",
  },
];

const source = [
  {
    name: "All",
    value: "all",
  },
  {
    name: "WhatsApp",
    value: "whatsapp",
  },
  {
    name: "Facebook",
    value: "facebook",
  },
  {
    name: "Website",
    value: "website",
  },
];

const exportItems = [
  {
    name: "PDF",
    value: "pdf",
  },
  {
    name: "JSON",
    value: "json",
  },
];

export default function ChatHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [filter, setFilter] = useState([getDateAfter(-7), getDateAfter(1)]);
  const [activeTab, setActiveTab] = useState(0);
  const [sessionData, setSessionData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  /*  structure
  [{
    sessionId: "a0096b2a-c6e8-4b55-948d-30e062c13939",
    createdAt: "2024-04-11T15:54:46.086Z",
    logs: [
      {
        id: "661807c52bd2a817f452f70a",
        userMsg: "hello bro",
        chatbotReply: " Hmm ,  I  am  not  sure . ",
        confidenceScore: 0,
        createdAt: "2024-04-11T15:54:45.866Z",
      }
    ],
    leads: []
  }]
  */

  useEffect(() => {
    setSessionData([]);
    setCurrentPage(1);
    loadChatSessionHistory(1);
  }, [filter]);

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  async function loadChatSessionHistory(page = 1) {
    if (isLoadingSession) return;
    setIsLoadingSession(true);

    const res = await getChatSessionHistory(
      getFormattedDate(filter[0]),
      getFormattedDate(filter[1]),
      id,
      page
    );

    /*
        "chatSessions": [
        {
            "_id": "661807c62bd2a817f452f70d",
            "chat_model_id": "ff1f0440-4d79-4053-ab24-bd017cf319fb",
            "user_msg": "hello bro",
            "lead_id": null,
            "chat_session_id": "a0096b2a-c6e8-4b55-948d-30e062c13939",
            "created_time": "2024-04-11T15:54:46.086Z",
            "__v": 0,
            "logs": [
                {
                    "_id": "661807c52bd2a817f452f70a",
                    "chat_session_id": "a0096b2a-c6e8-4b55-948d-30e062c13939",
                    "user_msg": "hello bro",
                    "chatbot_reply": " Hmm ,  I  am  not  sure . ",
                    "confidence_score": 0,
                    "created_time": "2024-04-11T15:54:45.866Z",
                    "__v": 0
                }
            ],
            "leads": [
                {
                    "_id": "66220bc1dd38d9d334f1f69b",
                    "chat_model_id": "1eb76579-feb0-4b1c-b143-a5ee8c7f24cd",
                    "title": "",
                    "name": "",
                    "email": "niteshdev547@gmail.com",
                    "phone_number": "",
                    "chat_session_id": "8954c313-39b0-4ffa-bf90-0dddfe95f2fd",
                    "created_time": "2024-04-19T06:14:25.528Z",
                    "__v": 0
                }
            ]
        },
    */
    if (res.data) {
      const sessions = res.data.chatSessions.map((session) => {
        let logs = session.logs.map((log) => {
          return {
            id: log._id,
            userMsg: log.user_msg,
            chatbotReply: log.chatbot_reply,
            confidenceScore: log.confidence_score,
            createdAt: new Date(log.created_time),
          };
        });

        logs = logs.sort(function (a, b) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return a.createdAt - b.createdAt;
        });

        setCurrentPage(page + 1);

        const leads = session.leads.map((lead) => {
          return {
            id: lead._id,
            email: lead.email,
            name: lead.name,
            phoneNumber: lead.phone_number,
            title: lead.title,
            createdAt: new Date(lead.created_time),
          };
        });

        return {
          sessionId: session.chat_session_id,
          createdAt: new Date(session.created_time),
          logs,
          leads,
        };
      });

      setSessionData((old) => [...old, ...sessions]);
    } else {
      toast.error(res.message);
    }

    setIsLoadingSession(false);
  }

  function downloadJsonFile() {
    const jsonStr = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "chat-history.json";
    document.body.appendChild(link);

    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function downloadPdfFile() {
    const response = await downloadChatHistory(
      getFormattedDate(filter[0]),
      getFormattedDate(filter[1]),
      id
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob); //here blobUrl is variable so we need to use blobUrl instead of url

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "chat-history.pdf";
    document.body.appendChild(link);

    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl); //here before it url is pass instead of blobUrl that was incorrect
  }

  function onExport(value) {
    if (value == "json") {
      downloadJsonFile();
    } else {
      downloadPdfFile();
    }
  }

  function onScroll(event) {
    const currentScroll = event.target.scrollTop;
    const maxScroll =
      event.target.scrollHeight - event.target.clientHeight - 20; // offset

    if (currentScroll >= maxScroll) {
      loadChatSessionHistory(currentPage);
      console.log("loading more");
    }
  }

  const { canChatbotExport } = useRole();

  return (
    <div className="chat-history">
      <h2>Chat History</h2>

      <div className="history-header">
        <div>
          <div>
            <p className="input-title">Filter</p>
            {/* <input
              id="start-date"
              type="daterange"
              placeholder="2024-03-11 ~ 2024-04-10"
            /> */}
            <DateRangePicker filter={filter} setFilter={setFilter} />
          </div>
          <div className="middle">
            <div>
              <p className="input-title">Confidence Score</p>
              <Dropdown items={confidenceScore} />
            </div>
            <div>
              <p className="input-title">Source</p>
              <Dropdown items={source} />
            </div>
          </div>
        </div>

        {canChatbotExport && (
          <Dropdown
            items={exportItems}
            icon={<DownloadIcon />}
            primary={true}
            text="Export"
            onSelect={onExport}
          />
        )}
        {/* <button className="primary" onClick={downloadJsonFile}>
          <DownloadIcon /> Export
        </button> */}
      </div>

      <br />
      <br />
      <br />

      {isLoadingSession && currentPage == 1 ? (
        <>
          <div className="skeleton wide heading"></div>
          <div className="skeleton text"></div>
          <div className="skeleton wide text"></div>
          <div className="skeleton wide text"></div>
          <div className="skeleton wide text"></div>
        </>
      ) : sessionData.length === 0 ? (
        <p className="no-his-msg">No conversations found</p>
      ) : (
        <div className="chat-history-holder">
          <div className="left" onScroll={onScroll}>
            {sessionData.map((session, index) => (
              <div
                onClick={() => setActiveTab(index)}
                key={index}
                className={activeTab == index ? "item active" : "item"}
              >
                <div className="title">
                  <span className="msg">{session.logs[0].userMsg}</span>
                  <span>{js_ago(session.createdAt)}</span>
                </div>
                <p>{removeMd(session.logs[0].chatbotReply)}</p>
              </div>
            ))}
          </div>
          <div className="right">
            {sessionData[activeTab] &&
              sessionData[activeTab].leads.length != 0 && (
                <div className="leads-area">
                  <p>Email · {sessionData[activeTab].leads[0].email}</p>
                  <span>
                    {js_ago(sessionData[activeTab].leads[0].createdAt)}
                  </span>
                </div>
              )}

            <div className="chat-area">
              {sessionData[activeTab] &&
                sessionData[activeTab].logs.map((log, index) => (
                  <div key={index}>
                    <div className="chat primary">
                      <div>
                        <p>{log.userMsg}</p>
                      </div>
                    </div>

                    <div className="chat">
                      <div>
                        <span className="level">
                          Confidence Score: {log.confidenceScore}
                        </span>
                        <Markdown>{log.chatbotReply}</Markdown>
                        {/* <button className="hover">Revise answer</button> */}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import "@/styles/CreateChatbot/index.css";
import Chatbot from "@/components/CreateChatbot/Chatbot";
import Settings from "@/components/CreateChatbot/Settings/index";
import Dashboard from "@/components/CreateChatbot/Dashboard/index";
import Sources from "@/components/CreateChatbot/Sources";
import Integrates from "@/components/CreateChatbot/Integrates";
import EmbedCode from "@/components/CreateChatbot/EmbedCode";
import Share from "@/components/CreateChatbot/Share";
import Delete from "@/components/CreateChatbot/Delete";
import { getChatbotById } from "@/lib/api/ApiUpdateChatbot";
import { toast } from "react-hot-toast";
import { getTabIndex, getTabName, timestampToCustomFormat } from "@/Utils";
import { useRouter } from "next/router";
import Link from "next/link";
import { getUserDetail } from "@/lib/api/ApiExtra";
import Head from "next/head";
import Stats from "@/components/CreateChatbot/Stats";

const tabContent = [
  "CHATBOT",
  "SETTINGS",
  "CHAT HISTORY & LEADS",
  "SOURCES",
  "INTEGRATES",
  "EMBED CODE",
  "SHARE",
  "STATISTICS",
  "DELETE",
];

export const ServerDataContext = createContext();

export default function UpdateChatbot() {
  const [activeTab, setActiveTab] = useState(-1);
  const [serverData, setServerData] = useState();
  const [userDetail, setUserDetail] = useState();

  const router = useRouter();
  const { id, tab } = router.query;

  useEffect(() => {
    if (id) {
      loadChatbot();
    }
  }, [id]);

  useEffect(() => {
    setActiveTab(getTabIndex(tab));
  }, [tab]);

  function generateTabLink(index) {
    return `/my-chatbot/update/${id}?tab=${getTabName(index)}`;
  }

  async function loadChatbot() {
    const userDetailPromise = getUserDetail();
    const chatbotDataPromise = getChatbotById(id);
    const [userDetail, chatbotData] = await Promise.all([
      userDetailPromise,
      chatbotDataPromise,
    ]);

    if (chatbotData.data) {
      setServerData(chatbotData.data);
      setUserDetail(userDetail);
    } else {
      toast.error(chatbotData.message);
    }
  }

  return (
    <>
      <ServerDataContext.Provider
        value={{ serverData, setServerData, userDetail }}
      >
        <Head>
          <title>Update Chatbot | UrbanChat.ai</title>
        </Head>
        <section className="create-chat">
          <div className="page">
            {serverData ? (
              <>
                <div className="header">
                  <h1>Update Chatbot</h1>
                  <span>
                    {timestampToCustomFormat(serverData.view[0].last_trained)}
                  </span>
                </div>

                <div className="content">
                  <div className="tab-container hide-scroll">
                    {tabContent.map((value, index) => {
                      return (
                        <Link key={index} href={generateTabLink(index)}>
                          <span className={activeTab == index ? "active" : ""}>
                            {value}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {activeTab == 0 && <Chatbot />}
                  {activeTab == 1 && <Settings />}
                  {activeTab == 2 && <Dashboard />}
                  {activeTab == 3 && (
                    <Sources userDetail={userDetail} isOutside={false} />
                  )}
                  {activeTab == 4 && <Integrates />}
                  {activeTab == 5 && <EmbedCode />}
                  {activeTab == 6 && <Share />}
                  {activeTab == 7 && <Stats />}
                  {activeTab == 8 && <Delete />}
                </div>
              </>
            ) : (
              <>
                <div>
                  <br />
                  <br />
                  <div className="heading skeleton"></div>
                  <div
                    className="text skeleton"
                    style={{ maxWidth: 800 }}
                  ></div>
                  <br />
                  <br />
                  <div className="text skeleton"></div>
                  <div className="text skeleton"></div>
                  <div className="text skeleton"></div>
                  <div className="text skeleton"></div>
                  <div className="text skeleton"></div>
                </div>
              </>
            )}
          </div>
        </section>
      </ServerDataContext.Provider>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import "../../styles/UpdateChatbot.css";
import { useRouter } from 'next/router';
import Sources from "../../components/CreateChatbot/Sources";
import { getUserDetail } from "@/lib/api/ApiExtra";
import Head from "next/head";

export default function CreateChatbot() {
  const [userDetail, setUserDetail] = useState(null);
  const router = useRouter();
  const { sub_tab } = router.query;
  async function loadDetail() {
    const _userDetail = await getUserDetail();
    if (_userDetail.data) {
      setUserDetail(_userDetail);
    }
  }

  useEffect(() => {
    loadDetail();
  }, []);

  // Default title and description
  let title = "Create Your Chatbot | UrbanChat.ai";
  let description = "Create a powerful AI chatbot with UrbanChat.ai - Easily add data sources, customize responses, and unlock advanced analytics to streamline customer support and drive sales.";

  // Title and description based on sub_tab
  switch (sub_tab) {
    case 'files':
      title = "Create Your Chatbot Files | UrbanChat.ai";
      description = "Create your own AI chatbot with documents or PDF using UrbanChat.ai. Easily add data sources, customize responses, and unlock advanced analytics to streamline customer support and drive sales.";
      break;
    case 'text':
      title = "Create Your Chatbot Text | UrbanChat.ai";
      description = "Create your own AI chatbot with text using UrbanChat.ai. Easily add data sources, customize responses, and unlock advanced analytics to streamline customer support and drive sales.";
      break;
    case 'website-link':
      title = "Create Your Chatbot Website Link | UrbanChat.ai";
      description = "Create your own AI chatbot trained on your website data. Leverage your existing website content to build an intelligent virtual assistant that provides 24/7 automated responses.";
      break;
    case 'qa':
      title = "Create Your Chatbot Q&A | UrbanChat.ai";
      description = "Create a chatbot trained on Q&A. Easily add Q&A in data sources and create your own ai chatbot and boost your business with a 24/7 automated assistant tailored to your needs.";
      break;
    case 'youtube':
      title = "Create Your Chatbot from YouTube Videos | UrbanChat.ai";
      description = "Create your own AI chatbot from YouTube videos with UrbanChat.ai. Simply provide the video URL, and our platform will automatically extract key information to build a customized chatbot.";
      break;
  }

  return (
    <>
      <Head>
        <title>
          {title}
        </title>
        <meta
          name="description"
          content={description}
          key="desc"
        />
      </Head>
      <section className="update-chatbot">
        <div className="page">
          <div className="header">
            <h1>Create Your Conversational AI Chatbot</h1>
            <span>Add your data sources to train your chatbot</span>
          </div>

          <div className="content">
            <Sources userDetail={userDetail} isOutside={true} />
          </div>
        </div>
      </section>
    </>
  );
}

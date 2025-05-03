// pages/index.js
import React from "react";
import Head from "next/head";
import "@/styles/AiAssistant/index.css"; // Assuming you have a CSS file for the page
import Layout from "@/components/layout/Layout";
export default function Webhook() {
  return (
    <>
      <Head>
        <title>
          Custom AI Chatbot Solutions for Your Business | UrbanChat.ai
        </title>
        <meta
          name="description"
          content="Empower your online presence with UrbanChat.ai's customizable AI chatbots. Perfect for businesses looking to automate customer support, enhance engagement, and boost efficiency. Start building your ideal chatbot today and transform your customer interaction experience. Join the future of AI chatbots with UrbanChat.ai."
          key="desc"
        />
      </Head>
      <Layout>
        <header className="header">
          <h1>Webhook</h1>
        </header>
      </Layout>
    </>
  );
}

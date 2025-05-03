import TrialSection from "@/components/HomePage/Trial";
import React from "react";
import integrationImage from "@/assets/integration.svg";
import "@/styles/extra-temp.css";
import Head from "next/head";

export default function Integration() {
  return (
    <>
      <Head>
        <title>
          Seamless AI Chatbot Integration for Your Business | UrbanChat.ai
        </title>
        <meta
          name="description"
          content="Streamline your customer engagement with UrbanChat.ai's seamless integrations. Connect your AI chatbot to popular platforms like Facebook Messenger, WhatsApp Business, Slack, and Shopify."
          key="desc"
        />
      </Head>
      <div className="page extra-temp">
        <div>
          <h1>Integration: Simplify Your Connections</h1>
          <br />
          <br />
          <img src={integrationImage.src} alt="Integration image" />

          <h3>Make Your Chatbot Work Everywhere</h3>
          <p>
            UrbanChat.ai is all about making things easy for businesses to
            connect with their customers. Here's how you can make UrbanChat.ai
            work for you:
          </p>
          <br />

          <h3>Chat on Popular Platforms</h3>

          <ul>
            <li>
              Facebook Messenger: Chat directly with customers on your
              business's Facebook page.
            </li>
            <li>
              WhatsApp Business: Send messages and answer questions on WhatsApp,
              where your customers are already chatting.
            </li>
            <li>
              Slack: Keep your team updated and answer client questions in your
              Slack channels.
            </li>
            <li>
              Shopify: Connect with customers shopping on your Shopify store.
            </li>
            <li>WordPress: Engage with visitors on your WordPress site.</li>
            <li>
              Custom Websites: Add our AI chatbots to any website you own,
              no matter how it's built.
            </li>
          </ul>

          <br />
          <h3>Use Any Type of Content</h3>
          <p>
            Your chatbot can learn from lots of different places to make
            conversations better:
          </p>

          <ul>
            <li>YouTube Videos: Teach it with video content.</li>
            <li>Audios: Use podcast clips or recorded instructions.</li>
            <li>Website URLs: Point it to specific web pages for info.</li>
            <li>Documents: Upload guides, product details, or FAQs.</li>
            <li>Q&A Pairings: Give it a list of questions and answers.</li>
            <li>
              Manual Text: Type in your own knowledge or special instructions.
            </li>
          </ul>
          <br />

          <h3>Why UrbanChat.ai?</h3>
          <p>
            Our goal is to make sure your Ai powered chatbot can engage to your
            customers wherever they are, using information from wherever you
            have it. This means better chats, happier customers, and more sales
            for you.
          </p>

          <br />

          <h3>Getting Started Is Easy</h3>
          <p>
            Setting up is simple. Choose where you want your chatbot, and we'll
            guide you on how to make it happen, step by step. If you ever get
            stuck or want to do more with your chatbot, just reach out. We're
            here to help make your chatbot exactly what you need for your
            business. With UrbanChat.ai, you're not just getting an Ai chatbot.
            You're getting a whole new way to engage with your customers, no
            matter where they are or what they need.
          </p>

          <br />
          <br />
          <br />
        </div>
      </div>
      <TrialSection />
    </>
  );
}

import TrialSection from "@/components/HomePage/Trial";
import React, { useEffect, useState } from "react";

import "@/styles/extra-temp.css";
import SearchIcon from "@/components/icons/SearchIcon";
import Head from "next/head";

const data = [
  {
    type: "general",
    question: "What is UrbanChat.ai?",
    answer:
      "UrbanChat.ai lets businesses build custom AI chatbots for seamless integration with websites and social platforms like Facebook, WhatsApp, and Shopify. It automates customer support, enhancing engagement and efficiency.",
  },
  {
    type: "general",
    question: "How does UrbanChat.ai work?",
    answer:
      "First, supply your chatbot with information from documents or your website URL. Then create and test your chatbot before embedding it seamlessly on your website or social platforms.",
  },
  {
    type: "general",
    question: "Who can benefit from using UrbanChat.ai?",
    answer:
      "Any business that wants to improve customer service, lead generation and sales online, like shops, agencies, and more.",
  },
  {
    type: "general",
    question: "What makes UrbanChat.ai different?",
    answer:
      "Our chatbot is easy to set up, works with many platforms, provide structured responses and improves itself from your feedback.",
  },
  {
    type: "technical",
    question: "How do I integrate UrbanChat.ai with my website?",
    answer:
      'Just sign up, create your chatbot, and then click "integrate" to choose where to connect. For embedding on your site via Shopify or WordPress, or using the iframe code, simply paste it just before the </body> tag in your HTML.',
  },
  {
    type: "technical",
    question:
      "Can UrbanChat.ai be integrated with platforms like Shopify, WhatsApp, and Facebook? ",
    answer:
      "Yes, we offer easy integration with these platforms. If you need any help, just email us at info@urbanchat.ai, and our team will assist you for free.",
  },
  {
    type: "technical",
    question: "Does UrbanChat.ai support multiple languages? ",
    answer:
      "Yes, it does. You can serve customers in various languages using UrbanChat.ai.",
  },
  {
    type: "technical",
    question: "How can I customize my UrbanChat.ai chatbot?",
    answer:
      "After creating your chatbot, go to the customize tab. There, you can adjust its look and responses to match your brand's style.",
  },
  {
    type: "technical",
    question: "What kind of customer support can I expect from UrbanChat.ai? ",
    answer:
      "You'll get friendly, helpful support for any issues or questions you have. Our team is ready to assist you via email, ensuring your UrbanChat.ai experience is smooth and productive.",
  },
  {
    type: "feature",
    question: "How do I integrate UrbanChat.ai with my website?",
    answer:
      'Just sign up and create your chatbot. After creation, click "integrate" and select how you want to connect—if embedding on Shopify or WordPress, or simply copy the iframe code and paste it just before the </body> tag in your HTML.',
  },
  {
    type: "feature",
    question:
      "Can UrbanChat.ai be integrated with platforms like Shopify, WhatsApp, and Facebook?",
    answer:
      "Absolutely, we make integrating with Shopify, WhatsApp, and Facebook smooth. If you need help, just email us at info@urbanchat.ai, and our team will assist you at no extra cost.",
  },
  {
    type: "feature",
    question: "Does UrbanChat.ai support multiple languages?",
    answer:
      "Yes, it does. UrbanChat.ai can interact with your customers in multiple languages.",
  },
  {
    type: "feature",
    question: "How can I customize my UrbanChat.ai chatbot?",
    answer:
      'After creating your chatbot, head over to the "customize" section. Here, you can tweak it to align with your brand\'s look and feel.',
  },
  {
    type: "feature",
    question: "What kind of customer support can I expect from UrbanChat.ai?",
    answer:
      "You can expect responsive and helpful support for any questions or issues you might have with UrbanChat.ai. We're here to ensure your experience is smooth and beneficial.",
  },
  {
    type: "feature",
    question: "How does UrbanChat.ai handle customer support?",
    answer:
      "UrbanChat.ai takes over your customer support by instantly responding to queries any time of the day, ensuring your customers always have help when they need it.",
  },
  {
    type: "feature",
    question: "Can UrbanChat.ai help with lead generation?",
    answer:
      "Yes, it can. UrbanChat.ai engages potential customers, collects their details, and helps you grow your leads effectively.",
  },
  {
    type: "feature",
    question: "How does UrbanChat.ai engage with users?",
    answer:
      "UrbanChat.ai engages users by providing timely, relevant responses to their questions, making interactions feel personal and helpful.",
  },
  {
    type: "feature",
    question: "What analytics and insights does UrbanChat.ai provide?",
    answer:
      "UrbanChat.ai offers insights on chatbot interactions, user engagement levels, and response effectiveness, helping you understand your customers better",
  },
  {
    type: "feature",
    question: "Can UrbanChat.ai automate all customer interactions?",
    answer:
      "While UrbanChat.ai can automate a vast majority of customer interactions, there might be complex queries that require human intervention. Our system is smartly designed to identify such cases and route them to your team.",
  },
  {
    type: "security",
    question: "How does UrbanChat.ai protect my data?",
    answer:
      "Your data is securely stored on AWS servers, with robust encryption and security measures in place. UrbanChat.ai prioritizes your privacy and security.",
  },
  {
    type: "security",
    question: "What is UrbanChat.ai's privacy policy?",
    answer:
      "Our privacy policy details how we handle and protect user and customer data, emphasizing our commitment to data security and privacy. It outlines users' rights regarding their data, including how to access or delete it.",
  },
];

export default function FAQ() {
  const [filter, setFilter] = useState(data);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const searchText = search.toLowerCase();
    if (search === "") {
      setFilter(data);
    } else {
      setFilter(
        data.filter((item) => item.question.toLowerCase().includes(searchText))
      );
    }
  }, [search]);

  function filterQuestion(type) {
    return filter.filter((item) => item.type === type);
  }
  return (
    <>
      <Head>
        <title>UrbanChat.ai FAQ - Your Questions Answered on AI Chatbots</title>
        <meta
          name="description"
          content="Streamline your customer support: Explore our FAQ to learn how UrbanChat.ai can automate interactions, boost engagement, and drive business success through intelligent automation."
          key="desc"
        />
      </Head>
      <div className="page">
        <div className="extra-temp">
          <h1>Your Questions, Answered: A Comprehensive FAQ on Conversational AI chatbot</h1>
          <br />

          <div className="search-area">
            <SearchIcon />
            <input
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search faq"
            />
          </div>
          <br />
          <br />

          {filterQuestion("general").length > 0 && <h3>General Questions</h3>}
          <ol>
            {filterQuestion("general").map((item, index) => (
              <li key={index}>
                <p>{item.question}</p>
                <ul>
                  <li>{item.answer}</li>
                </ul>
              </li>
            ))}
          </ol>

          {filterQuestion("technical").length > 0 && (
            <h3>Technical Questions</h3>
          )}
          <ol>
            {filterQuestion("technical").map((item, index) => (
              <li key={index}>
                <p>{item.question}</p>
                <ul>
                  <li>{item.answer}</li>
                </ul>
              </li>
            ))}
          </ol>

          {filterQuestion("feature").length > 0 && <h3>Usage and Features</h3>}

          <ol>
            {filterQuestion("feature").map((item, index) => (
              <li key={index}>
                <p>{item.question}</p>
                <ul>
                  <li>{item.answer}</li>
                </ul>
              </li>
            ))}
          </ol>

          {filterQuestion("security").length > 0 && (
            <h3>Security and Privacy</h3>
          )}

          <ol>
            {filterQuestion("security").map((item, index) => (
              <li key={index}>
                <p>{item.question}</p>
                <ul>
                  <li>{item.answer}</li>
                </ul>
              </li>
            ))}
          </ol>

          <br />
          <br />
          <br />
        </div>
      </div>
      <TrialSection />
    </>
  );
}

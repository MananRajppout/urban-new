import TrialSection from "@/components/HomePage/Trial";
import React, { useEffect, useState } from "react";

import "@/styles/extra-temp.css";
import SearchIcon from "@/components/icons/SearchIcon";
import Head from "next/head";

const data = [
  {
    type: "e-commerce",
    title: "Retail & E-commerce",
    items: [
      "24/7 Customer Service: Answer product inquiries even off regular hours or holidays, capturing emails, track orders, and handle returns or exchanges anytime, improving shopping experience and customer satisfaction.",
      "Personalized Shopping Assistance: Recommend products based on customer inquiry and browsing history, increasing sales and customer loyalty.",
    ],
  },
  {
    type: "hospitality-travel",
    title: "Hospitality & Travel",
    items: [
      "Booking and Reservations: Allow customers to book rooms, flights, or tables directly through the chatbot, simplifying the reservation process.",
      "Local Information & Services: Provide guests with information about local attractions, dining, and services to enhance their stay.",
    ],
  },

  {
    type: "healthcare",
    title: "Healthcare & Medical",
    items: [
      "Appointment Scheduling: Enable patients to schedule, reschedule, or cancel appointments without human intervention, streamlining office operations.",
      "FAQs and Information: Offer immediate answers to general inquiries, insurance queries, and clinic services, reducing call volume for staff.",
    ],
  },
  {
    type: "real-estate",
    title: "Real Estate",
    items: [
      "Property Inquiries: Instantly answer questions about listings, availability, prices, and more, keeping potential buyers engaged.",
      "Virtual Tours & Scheduling: Facilitate scheduling of virtual or in-person property tours directly through the chatbot.",
    ],
  },
  {
    type: "education",
    title: "Education",
    items: [
      "Admissions & Enrollment: Assist prospective students through the application process, providing information on programs, requirements, and deadlines.",
      "Student Support: Answer common student queries about courses, schedules, campus services, and more, improving student experiences.",
    ],
  },
  {
    type: "finance-banking",
    title: "Finance & Banking",
    items: [
      "Financial Advice & Services: Offer basic financial advice, information on banking products, and assist with transactions securely",
      "Answer Common Inquries: Help customers to get general inquiries about your services.",
    ],
  },
  {
    type: "marketing-agencies",
    title: "Marketing Agencies",
    items: [
      "Lead Generation: Capture leads through engaging conversations, collecting contact information and preferences for targeted follow-ups.",
      "Campaign Feedback: Collect customer feedback on marketing campaigns directly through the chatbot, offering valuable insights for improvement.",
    ],
  },
];

export default function UseCase() {
  const [filter, setFilter] = useState(data);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const searchText = search.toLowerCase();
    if (search === "") {
      setFilter(data);
    } else {
      setFilter(
        data.filter((item) =>
          item.items.join(" ").toLowerCase().includes(searchText)
        )
      );
    }
  }, [search]);

  function filterQuestion(type) {
    return filter.filter((item) => item.type === type);
  }
  return (
    <>
      <Head>
        <title>
          Explore AI Chatbot Use Cases | UrbanChat.ai Solutions for Every
          Industry
        </title>
        <meta
          name="description"
          content="Discover how UrbanChat.ai's can transform your business across industries. Automate customer interactions, enhance engagement, and drive sales with 24/7 support, and more."
          key="desc"
        />
      </Head>
      <div className="page">
        <div className="extra-temp">
          <h1>Use Cases for UrbanChat's AI Chatbot</h1>
          <br />

          <div className="search-area">
            <SearchIcon />
            <input
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search use cases..."
            />
          </div>
          <p>
            Discover how AI chatbots can transform your business by automating
            customer interactions, enhancing user engagement, and driving sales.
            Here's how different industries can benefit from our AI chatbot.
          </p>
          <br />
          <br />

          {filter.map((item, index) => (
            <div key={index}>
              <h3>{item.title}</h3>
              <ul>
                {item.items.map((item2, index2) => (
                  <li key={index2}>
                    <p>{item2}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <br />
          <br />
          <br />

          <p className="center">
            The potential use cases for UrbanChat.ai are vast and varied,
            limited only by how creatively you harness its capabilities. To
            explore how it can be tailored specifically for your business needs
            and to maximize automation, feel free to contact us. We're here to
            help customize the perfect chatbot solution for you
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

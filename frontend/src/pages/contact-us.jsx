import React, { useRef, useState } from "react";
import "../styles/contact-us.css";
import Dropdown from "../components/Widget/Dropdown";
import { sendContactUs } from "../lib/api/ApiExtra";
import toast from "react-hot-toast";
import Head from "next/head";

const problems = [
  {
    name: "Billing",
    value: "Billing",
  },
  {
    name: "Others",
    value: "Others",
  },
];

const severity = [
  {
    name: "Low",
    value: "Low",
  },
  {
    name: "Medium",
    value: "Medium",
  },
  {
    name: "High",
    value: "High",
  },
];

export default function () {
  const formData = useRef({
    email: "",
    chatbot_id: "",
    problem_area: "Billing",
    severity: "Low",
    subject: "",
    description: "",
  });

  const form = useRef(null);

  const [isSubmit, setIsSubmit] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (isSubmit) return;

    setIsSubmit(true);
    const res = await sendContactUs(formData.current);
    setIsSubmit(false);

    if (res.data) {
      toast.success("Submitted successfully");
      form.current.reset();
    } else {
      toast.error(res.message);
    }
  }
  return (
    <div className="contact-us">
      <Head>
        <title>
          Contact UrbanChat.ai: Get in Touch with AI Chatbot Experts
        </title>
        <meta
          name="description"
          content="Contact UrbanChat for personalized solutions to streamline customer support and drive business success. Get in touch today to revolutionize your customer engagement strategy."
          key="desc"
        />
      </Head>
      <form ref={form} onSubmit={onSubmit} className="page">
        <div>
          <div className="inner">
            <h3>Connect with us: Your AI Chatbot Solutions Partner</h3>

            <p className="input-title">Email</p>
            <input
              required
              type="email"
              onChange={(e) => {
                formData.current.email = e.target.value;
              }}
            />

            <p className="input-title">Chatbot Id</p>
            <input
              required
              type="text"
              onChange={(e) => {
                formData.current.chatbot_id = e.target.value;
              }}
            />

            <div className="col-2">
              <div>
                <p className="input-title">Problem Area</p>
                <Dropdown
                  items={problems}
                  value={formData.current.problem_area}
                  onSelect={(e) => (formData.current.problem_area = e)}
                />
              </div>
              <div>
                <p className="input-title">Severity</p>
                <Dropdown
                  items={severity}
                  value={formData.current.severity}
                  onSelect={(e) => (formData.current.severity = e)}
                />
              </div>
            </div>

            <p className="input-title">Subject</p>
            <input
              required
              type="text"
              onChange={(e) => {
                formData.current.subject = e.target.value;
              }}
            />

            <p className="input-title">Description</p>
            <textarea
              rows={5}
              required
              onChange={(e) => {
                formData.current.description = e.target.value;
              }}
            ></textarea>
          </div>
        </div>
        <div className="bottom">
          <p>Please add a description before submitting your request.</p>
          <button className="hover" type="submit">
            {isSubmit ? (
              <div className="loading dark small"></div>
            ) : (
              "Submit Case"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

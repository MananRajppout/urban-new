import React from "react";
import faqData from "@/data/faqData.json";
import FaqChild from "./FaqChild";
import "@/styles/faq.css";

export default function FAQ() {
  return (
    <div className="faq">
      <div className="page">
        <h2>FAQ - Frequently asked questions</h2>

        {faqData.map((faq, index) => {
          return (
            <FaqChild key={index} title={faq.title} content={faq.content} />
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import "../../styles/HomePage/why-choose.css";
import Link from "next/link";
import corporateImg from "@/assets/home/corporate.png";
import webSoftImg from "@/assets/home/web-soft.png";
import marketingImg from "@/assets/home/marketing.png";
import SpeedIcon from "../icons/SpeedIcon";
import CertificateIcon from "../icons/CertificateIcon";
import EditDocumentIcon from "../icons/EditDocumentIcon";
import AnalyticIcon from "../icons/AnalyticIcon";
import Support24Icon from "../icons/Support24Icon";
import LanguageIcon from "../icons/LanguageIcon";

export default function WhyChooseSection() {
  return (
    <section className="why-choose-section">
      <div className="page">
        <div className="holder">
          <div className="left">
            <div className="card">
              <SpeedIcon />
              <span>Fast Text Generate</span>
              <p>Generate text responses quickly and efficiently</p>
            </div>
            <div className="card">
              <CertificateIcon />
              <span>High Quality Content</span>
              <p>
                Get content tailored to your specific needs, delivered directly
                to you.
              </p>
            </div>
            <div className="card">
              <EditDocumentIcon />
              <span>Edit</span>
              <p>Edit your chatbot as you like this is too much easy</p>
            </div>
            <div className="card">
              <AnalyticIcon />
              <span>Analytics</span>
              <p>Analytics your data anytime so you know how it's growing</p>
            </div>
            <div className="card">
              <LanguageIcon />
              <span>40+ Language</span>
              <p>
                Connect with customers in over 40 languages for effortless
                support.
              </p>
            </div>
            <div className="card">
              <Support24Icon />
              <span>24/7 Hours Support</span>
              <p>
                No matter your time zone or question, our chatbot is hereto
                help.
              </p>
            </div>
          </div>

          <div className="right">
            {/* <h2>Why Choose Urbanchat</h2> */}
            <h2>
              Solve Your Customer Support Challenges with AI
              Chatbots
            </h2>
            <p>
              Struggling with overflowing customer queries and rising support
              costs? AI chatbots are here to transform your
              customer service. These smart chatbots not only help you handle
              inquiries effortlessly but also seamlessly integrate with popular
              platforms like Facebook, WhatsApp, Shopify and Wordpress.
            </p>

            <p>
              By automating responses and capturing leads directly, they free up
              your team to focus on bigger tasks, ultimately boosting your sales
              and engagement.
            </p>
            <p>
              Reduce your customer support expenses and improve satisfaction
              with our efficient AI chatbots. Embrace the power of AI chatbots
              and turn your customer service into your biggest
              strength.
            </p>

            <Link href="/my-chatbot/create">
              <button className="primary hover">Get Start Now</button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import "../../styles/HomePage/featureSection.css";
import aiImage from "../../assets/home_ai.svg";
import Link from "next/link";
import chatBoxImg from "@/assets/home/chatbox.svg";
import backgroundImage from "../../assets/youtube-thumbnail.png";
import PlayVideoIcon from "../icons/PlayVideoIcon";

export default function FeatureSection() {
  const [videoPlayed, setVideoPlayed] = useState(false);

  const handlePlayButtonClick = () => {
    setVideoPlayed(true);
  };

  return (
    <>
      <section className="feature-section">
        <div className="page">
          <div>
            {!videoPlayed ? (
              <div className="video-overlay">
                <img src={backgroundImage.src} alt="Video background" />
                <div className="play-icon-container" onClick={handlePlayButtonClick}>
                  <span>
                    <PlayVideoIcon />
                  </span>
                </div>
              </div>
            ) : (
              <div className="video-overlay">
                <iframe
                  src="https://www.youtube.com/embed/vXuwHfVLhFQ?autoplay=1"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
          <div className="holder">
            <div className="left">
              <h2>How it Works?</h2>
              <p>
                Simply input your info, tailor the chatbot to your brand, test
                its interactions, and then integrate it across your website and
                social platforms.
              </p>

              <div>
                <span className="count">1</span>
                <div>
                  <span className="label">Provide Information Source</span>
                  <p>
                    Feed Your Knowledge: Start by inputting your source of
                    information into the chatbot—be it your website URL,
                    documents, or FAQs.
                  </p>
                </div>
              </div>

              <div>
                <span className="count">2</span>
                <div>
                  <span className="label">Customize Your Chatbot</span>
                  <p>
                    Brand It Your Way: Tailor the chatbot’s appearance and
                    responses to fit your brand guidelines and ensure it prompts
                    for all necessary information.
                  </p>
                </div>
              </div>

              <div>
                <span className="count">3</span>
                <div>
                  <span className="label">Test Your Chatbot</span>
                  <p>
                    Try Before You Deploy: Experiment with your chatbot, testing
                    its responses and interactions to ensure it meets your
                    expectations.
                  </p>
                </div>
              </div>

              <div>
                <span className="count">4</span>
                <div>
                  <span className="label">Embed and Connect</span>
                  <p>
                    Go Live: Easily integrate the chatbot into your website or
                    connect it with platforms like Facebook, WhatsApp, and
                    WordPress to start engaging with users.
                  </p>
                </div>
              </div>
            </div>
            <div className="right">
              <img src={chatBoxImg.src} alt="urbanchat" />
            </div>
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="page">
          <div>
            <img src={aiImage.src} alt="Ai image" />
          </div>
        </div>
      </section>
    </>
  );
}

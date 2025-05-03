import React, { useEffect, useState } from "react";
import "../../styles/HomePage/landing.css";
import "../../styles/page.css";
import ladingImg from "../../assets/landing.png";
import Link from "next/link";
import LandingLayer from "../icons/LandingLayer";
import ArrowIcon from "../icons/ArrowIcon";
import PlayIcon from "../icons/PlayIcon";
import VoiceIcon from "@/assets/Icons/voice.svg";

export function Landing() {
  const [isUserExist, setIsUserExist] = useState(false);

  useEffect(() => {
    setIsUserExist(localStorage.getItem("access_token") ? true : false);
  }, []);

  return (
    <section className="landing ">
      <LandingLayer />
      <div className="page">
        <div className="left" style={{ marginBottom: 0 }}>
          <h2 className="text-center heading primary-heading ">
            Transfer Unanswered Calls to your AI Voice Agents
          </h2>
          <p
            className="subtitle text-start heading-text"
            style={{ marginTop: 10 }}
          >
            These AI voice agents can answer your calls just like a human,
            resolve customer queries, book appointments, and take orders.
          </p>
          <p className="subtitle text-start heading-text">
            Our intelligent AI agents can recognize the caller's intent and know
            when to end a call, transfer it, or book an appointment.
          </p>
          <div className="buttons">
            <Link href="/ai-assistant/ai-agents">
              <button className="hover primary cursor-pointer">
                Build Your Ai Voice Agent <ArrowIcon />
              </button>
            </Link>
            {/* <button className="play-btn hover">
              <PlayIcon /> Introduction
            </button> */}
          </div>
        </div>
        {/* <div className="right">
          <img src={ladingImg.src} alt="urbanchat landing" />
        </div> */}
      </div>
      {/* <div className="coming-soon">
        <img src={VoiceIcon.src} alt="Voice img" />
        <div>
          <span className="label">COMING SOON</span>
          <span className="title">AI Voice Assistant</span>
          <span className="text">Conversional AI with the live agent</span>
        </div>
        <button className="primary hover">Coming soon</button>
      </div> */}
    </section>
  );
}

import Link from "next/link";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function PricingDetail() {
  return (
    <div className="mt-10 mb-16">
      <h1 className="text-5xl font-bold mb-4 text-center text-white">
        Affordable and flexible pricing
      </h1>
      <h2 className="text-3xl mb-10 text-center text-gray-400 ">
        built for voice AI
      </h2>
      <div className=" mx-auto  backdrop-filter backdrop-blur-lg rounded-lg shadow-lg mt-10 flex flex-col md:flex-row justify-between items-stretch ">
        <div className="w-full bg-[#191919] mb-8 flex-1 p-6  bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg mr-4"
          // style={{background:'red',marginBottom:'1.2rem',width:'100%'}}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Pay as you go</h2>
          <ul className="text-gray-400 mb-4">
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> $0 to start.
            </li>
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> 10 mins of free access
            </li>
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> 20 concurrent calls
            </li>
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Onboarding demo
              repository available
            </li>
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Discord and community
              support.
            </li>
          </ul>
          {/* <hr className="border-gray-600 my-4" />
          <h3 className="text-xl font-bold text-white mb-2">Detail Pricing</h3>
          <div className="text-gray-400">
            <h5 className="font-bold text-lg">Conversation voice engine API</h5>
           
            <p>
              - With Elevenlabs voices (
              <span className="text-green-500">$0.10</span>)/min
            </p>
            <h5 className="font-bold mt-4 text-lg">LLM Agent</h5>
      
            <p>
              - Retell LLM - GPT 3.5 turbo (
              <span className="text-green-500">$0.02</span>)/min
            </p>
            <p>
              - Retell LLM - GPT 4o (
              <span className="text-green-500">$0.10</span>)/min
            </p>
            <p>
              - Retell LLM - GPT 4 turbo (
              <span className="text-green-500">$0.20</span>)/min
            </p>
          
            <h5 className="font-bold mt-4 text-lg">Telephony</h5>
            <p>
              - Urbanchat Twilio (
              <span className="text-green-500">$0.01</span>)/min
            </p>
          </div> */}
          <Link href={"/ai-assistant/billing"}>
            <button className="border-0 mt-6 bg-white w-full text-black cursor-pointer py-3 px-6 rounded-full transform transition-transform hover:scale-105">
              Try us for free
            </button>
          </Link>
        </div>
        <div className="flex-1 p-6 bg-[#191919] bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg ml--10 h-fit">
          <h2 className="text-2xl font-bold text-white mb-4">
            Enterprise Plan
          </h2>
          <h5 className="font-light">
            For companies with large volumes, data or deployment requirements,
            or support needs.
          </h5>
          <ul className="text-gray-400 mb-4">
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Includes everything
              from pay as you go
            </li>
            <li className="flex items-start mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Discounted pricing
              based on volumes (as low as $0.05 per minute)
            </li>
            <li className="flex items-center mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Custom concurrent calls
              based on volumes
            </li>
            <li className="flex items-start mb-2">
              <FaCheckCircle className="mr-2 text-lg" /> Premium private Slack
              channel support with dedicated support teams.
            </li>
          </ul>
          <Link href={"/ai-assistant/billing"}>
            <button className="border-0 mt-6 bg-white w-full cursor-pointer text-black py-3 px-6 rounded-full transform transition-transform hover:scale-105">
              Contact Sales
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

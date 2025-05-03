import React, { useEffect, useState } from "react";
import Toggle from "../../components/Widget/Toggle";
import FAQ from "../../components/HomePage/FAQ";
import "@/styles/pricing.css";
import {
  getPricingModel,
  getPaymentSession,
  getIpDetails,
} from "../../lib/api/ApiExtra";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import Head from "next/head";
import AiChabotPricingCard from "@/components/Pricing/AiChatbot/AiChabotPricingCard";
import PricingCard from "@/components/Pricing/VoiceAssistant/PricingCard";
import PricingTable from "@/components/Pricing/VoiceAssistant/PricingTable";
import CostEstimator from "@/components/Pricing/VoiceAssistant/CostEstimator";
import PricingDetail from "@/components/Pricing/VoiceAssistant/PricingDetail";
import CustomPricing from "@/components/Pricing/VoiceAssistant/CustomPricing";

export async function getServerSideProps() {
  const promise1 = getIpDetails();
  const promise2 = getPricingModel();

  const [ipDetail, res] = await Promise.all([promise1, promise2]);

  let isSuccess = false;

  let modelData = [];
  if (res.data) {
    modelData = res.data.pricePlans;
    isSuccess = true;
  } else {
    isSuccess = false;
  }
  return { props: { modelData, isSuccess, ipDetail } };
}

export default function Pricing({ modelData, isSuccess, ipDetail }) {
  /* for adding the AI Chatbot functionality do comment out the code where comment out is write and just
    below it also and do comment where useStat is useState("voice Assistant")
  */
  // const [selectedModule, setSelectedModule] = useState("AI ChatBot"); 
  const [selectedModule, setSelectedModule] = useState("Voice Assistant");

  return (
    <div className="pricing">
      <Head>
        <title>
          UrbanChat.ai Pricing Plans - Affordable AI Chatbot Solutions
        </title>
        <meta
          name="description"
          content="Discover affordable AI chatbot solutions tailored to your business needs with UrbanChat.ai. Transparent pricing plans for enterprises of all sizes."
          key="desc"
        />
      </Head>
      <div className="page">
        <div className="flex justify-center  my-4">
          <div className="flex space-x-2 bg-gradient-to-r gap-3 rounded-full p-1 shadow-lg">
            {/* do comment in below code for add the functionality of Ai chatbot */}
            <button
              className={`px-6 py-3 rounded-full focus:outline-none transition-all duration-300 ${
                selectedModule === "AI ChatBot"
                  ? "primary"
                  : "outline"
              }`}
              onClick={() => setSelectedModule("AI ChatBot")}
            >
              AI ChatBot
            </button>
            <button
              className={`px-6 py-3 rounded-full focus:outline-none transition-all duration-300 ${
                selectedModule === "Voice Assistant"
                  ? "primary"
                  : "outline"
              }`}
              onClick={() => setSelectedModule("Voice Assistant")}
            >
              Voice Assistant
            </button>
          </div>
        </div>
         {/* do comment in below code for add the functionality of Ai chatbot */}
        {selectedModule === "AI ChatBot" ? (
          <AiChabotPricingCard
            modelData={modelData}
            isSuccess={isSuccess}
            ipDetail={ipDetail}
          />
        ) : 
         ( 
          <div className="text-white bg-black">
            <PricingCard />
            {/* <PricingTable /> */}
            {/* <PricingDetail/> */}
            {/* <CustomPricing/> */}
            {/* <CostEstimator /> */}
          </div>
         ) 
        } 
        {/* <h2 className="center">Affordable AI Chatbot Solutions</h2>
        <p className="center">
          Get additional 45 Days by subscribing yearly...!
        </p>
        <div className="pricing-toggle">
          <h3>Monthly</h3>
          <Toggle
            onToggle={(e) => {
              if (e) setDuration("year");
              else setDuration("month");
            }}
          />
          <div>
            <h3>Yearly</h3>
            <span>save 25%</span>
          </div>
        </div>

        <div>
          {isSuccess && (
            <div className="pricing-cards">
              {modelData
                .filter((model) => model.period == duration)
                .map((model, index) => (
                  <div
                    key={index}
                    className={index == 1 ? "card label-card" : "card"}
                  >
                    {index == 1 && <span className="label">Best Value</span>}
                    <div>
                      <div className="price">
                        <h2>${model.cost}</h2>
                        <span>/{model.period}</span>
                      </div>
                      <div className="list">
                        <h3>{model.name}</h3>
                      </div>
                      <div className="list">
                        <p>{model.messages_quota_user} message credits/month</p>
                        <p>{model.number_of_chatbots} chatbots</p>
                        <p>{model.allowed_characters} characters/chatbot</p>
                        <p>Unlimited links to train on</p>
                        {model.document_upload && <p>Train from documents</p>}
                        {model.manual_code_embed && <p>Embed on websites</p>}
                        {model.wordpress_allowed && (
                          <p>Wordpress Integration</p>
                        )}
                        {model.shopify_allowed && <p>Shopify Integration</p>}
                        {model.whatsapp_allowed && <p>Whatsapp Integration</p>}
                        {model.facebook_allowed && <p>Facebook Integration</p>}
                        {model.name == "Unlimited" && (
                          <p>Access to GPT 4 & GPT 4 Turbo</p>
                        )}
                        <p>Capture leads</p>
                        <p>Train from Video</p>
                        <p>Train from Audio Files (Coming Soon)</p>
                        {model.cost != 0 && <p>24/7 Support</p>}
                        <p>Priority Support</p>
                        {model.support_team && <p>Tech Support</p>}
                        {model.remove_powered_by && <p>Remove Powered By</p>}
                        {model.soft_delete && <p>Soft Delete</p>}
                        <p>Chat Routing to Human Support (Coming Soon)</p>
                      </div>
                    </div>
                    {model.cost != 0 && (
                      <button
                        onClick={() => makePayment(model._id)}
                        className="hover"
                      >
                        {selectedModelId == model._id ? (
                          <span className="loading small"></span>
                        ) : (
                          <> {"Subscribe"}</>
                        )}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div> */}

        {/* <div>
                <FAQ />
                <br />
                <br />
            </div> */}
      </div>
    </div>
  );
}

// 2,000 message credits/month

// 3 chatbots

// 11,000,000 characters/chatbot

// Unlimited links to train on

// Train from documents

// Embed on websites

// WordPress integration

// Shopify integration

// WhatsApp Business integration

// Capture leads

// Tech Support

// Train from Video (Coming Soon)

// Train from Audio Files (Coming Soon)

// Priority Support

// Tech Support

// Chat Routing to Human Support (Coming Soon)

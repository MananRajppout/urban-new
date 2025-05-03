import React, { useState } from "react";
import Toggle from "@/components/Widget/Toggle";
import "@/styles/pricing.css";
import { getPaymentSession } from "@/lib/api/ApiExtra";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import Head from "next/head";

export default function AiChabotPricingCard({
  modelData,
  isSuccess,
  ipDetail,
}) {
  const [duration, setDuration] = useState("month"); // month or year
  const [selectedModelId, setselectedModelId] = useState(null);

  /*
  _id: string;
  messages_quota_user: number;
  name: string;
  period: string;
  cost: number;
  allowed_characters: number;
  facebook_allowed: boolean;
  whatsapp_allowed: boolean;
  shopify_allowed: boolean;
  wordpress_allowed: boolean;
  manual_code_embed: boolean;
  support_team: boolean;
  document_upload: boolean;
  remove_powered_by: boolean;
  number_of_chatbots: number;
  soft_delete: boolean;
  created_time: string;
  last_mod_time: string;
    */

  async function makePayment(pricing_id) {
    if (selectedModelId) {
      return;
    }
    setselectedModelId(pricing_id);
    const res = await getPaymentSession({ pricing_plan_id: pricing_id });
    if (!res.data) {
      toast.error("Something went wrong");
      setselectedModelId(null);
      return;
    }
    // const stripePublicKey = "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1"
    // const stripePublicKey =
    //   "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1";
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

    const stripe = await loadStripe(stripePublicKey);
    const result = stripe.redirectToCheckout({
      sessionId: res.data.stripeSessionId,
    });
    setselectedModelId(null);
  }

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
        <h1 className="text-4xl font-bold mb-0 text-center">
          Affordable AI Chatbot Solutions
        </h1>
        {/* <h2 className="center">Affordable AI Chatbot Solutions</h2> */}
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
        </div>
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

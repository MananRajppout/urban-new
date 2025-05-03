"use client";

import Image from "next/image";
import tick from "@/assets/Icons/tick.png";

const pricingData = [
  {
    title: "Basic",
    price: "₹2999",
    period: "per month",
    billed: "30-Day Validity",
    save: "",
    benefits: [
      "Real-Time Speech-to-Text",
      "Multilingual AI Voice Agent",
      "Indian Accent & Dialect Support",
      "500 Minutes Included",
      "Standard Support",
      "Prompt Enhance Support",
    ],
    link: "https://buy.stripe.com/aEUaFm8Qp1lba0UbIL",
  },
  {
    title: "Advance",
    price: "₹9999",
    period: "per month",
    billed: "30-Day Validity",
    save: "",
    benefits: [
      "Real-Time Speech-to-Text",
      "Multilingual AI Voice Agent",
      "Indian Accent & Dialect Support",
      "2,500 Minutes Included",
      "Priority Support",
      "Prompt Enhance Support",
    ],
    link: "https://buy.stripe.com/8wMbJq1nXe7Xeha9AE",
  },
  {
    title: "Premium+",
    price: "$349",
    period: "/ month",
    billed: "Billed annually",
    save: "SAVE 12%",
    benefits: [
      "Everything in Premium, and",
      "40000 message credits",
      "10 chatbots",
      "14000000 characters per chatbot",
    ],
  },
];

export default function PricingCard() {
  return (
    <div className="flex flex-col items-center bg-black text-white px-4 mt-6 mb-16">
      <h1 className="text-4xl font-bold mb-0 text-center">
        Upgrade to Premium
      </h1>
      <p className="text-lg text-center mb-10 text-[#808080]">
        Enjoy an enhanced experience, exclusive creator tools, top-tier
        verification and security.
      </p>
      <div className="flex flex-wrap gap-8 w-full justify-center sm:items-center sm:flex-col md:flex-row lg:flex-row">
        {pricingData.map((plan, index) => (
          <div
            key={index}
            className={`w-full fade-in max-w-[400px]  p-8 rounded-3xl flex flex-col transition-all duration-300 shadow-lg ${
              plan.title === "Premium+"
                ? `bg-[--color-primary]`
                : "bg-[#191919]"
            } hover:shadow-xl`}
            style={{ minHeight: "465px" }}
          >
            <h2 className="text-xl font-semi-bold mb-4 ">{plan.title}</h2>
            <p className="text-4xl font-bold mb-2 ">
              {plan.price}{" "}
              <span className="text-lg font-light">{plan.period}</span>
            </p>
            <p className="text-sm mb-6 flex items-center">
              {plan.billed}
              {plan.save && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    plan.title === "Premium+"
                      ? "bg-black text-white"
                      : "bg-teal-900 text-white"
                  }`}
                >
                  {plan.save}
                </span>
              )}
            </p>
            <a
              href={plan.link || "#"}
              className="w-full py-2 bg-white text-black rounded-full mb-6 transition-transform hover:scale-110 hover:animate-pulse text-center"
            >
              Subscribe
            </a>
            <ul className="text-sm space-y-4">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <Image
                    src={tick}
                    alt="tick"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

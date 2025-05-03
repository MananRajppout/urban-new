import Link from "next/link";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function CustomPricing() {
  return (
    <div className="mt-10 mb-16">
      <h1 className="text-5xl font-bold mb-4 text-center text-white">
        Affordable and flexible pricing
      </h1>
      <h2 className="text-3xl mb-10 text-center text-gray-400 ">
        Built for voice AI
      </h2>
      <div className="mx-auto max-w-screen-sm flex-1 p-6 bg-[#191919] bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg ml--10 h-fit">
        <h2 className="text-2xl font-bold text-white mb-4">
          Custom Pricing Available
        </h2>
        <h5 className="font-light">
          Every business has unique needs, and we tailor our pricing to fit
          yours.
        </h5>
        <ul className="text-gray-400 mb-4">
          <li className="flex items-center mb-2">
            <FaCheckCircle className="mr-2 text-lg" /> Scalable plans to match
            your call volume
          </li>
          <li className="flex items-start mb-2">
            <FaCheckCircle className="mr-2 text-lg" /> Cost-effective AI voice
            solutions
          </li>
          <li className="flex items-center mb-2">
            <FaCheckCircle className="mr-2 text-lg" /> 24/7 call handling
            without extra hiring
          </li>
        </ul>
        <h5 className="font-light">Get a personalized quote today!</h5>
        <Link href="mailto:alex@urbanchat.ai?subject=Custom Pricing Inquiry">
          <button className="border-0 mt-6 bg-white w-full cursor-pointer text-black py-3 px-6 rounded-full transform transition-transform hover:scale-105">
            Contact US
          </button>
        </Link>
      </div>
    </div>
  );
}

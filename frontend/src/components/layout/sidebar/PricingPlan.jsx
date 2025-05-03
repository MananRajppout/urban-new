import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Check } from "lucide-react";
import { getCurrentPlanDetails } from "@/lib/api/ApiExtra";
import useVoiceInfo from "@/hooks/useVoice";

const PricingPlan = ({ activeService }) => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentAiPlan, setCurrentAiPlan] = useState(null);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const response = await getCurrentPlanDetails();
        if (response && response?.data) {
          setCurrentPlan(response?.data?.pricingPlan);
          setCurrentAiPlan(response?.data?.aiPricingPlan);
        } else {
          console.log("No valid data in response:", response);
        }
      } catch (error) {
        console.error("Error fetching current plan:", error);
      }
    };

    fetchCurrentPlan();
  }, []);

  const voiceInfo = useVoiceInfo();

  return (
    <Link
      href="/subscription-plans"
      className="no-underline mx-2 mb-4 p-4 rounded-lg bg-glass-panel-light/20 border border-solid border-[rgba(255,255,255,0.1)] hover:bg-glass-panel-light/30 transition-colors"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Crown className="h-4 w-4 text-yellow-400 mr-2" />
          <span className="text-sm font-medium text-white">
            {/* {activeService === "voice"
              ? currentAiPlan?.name || "No AI Plan"
              : currentPlan?.name || "No Plan"} */}
            Your Plan
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            voiceInfo.voicePlan == "inactive"
              ? "bg-red-600 text-white" // High contrast for inactive state
              : "bg-teal-700 text-white" // High contrast for active state
          }`}
        >
          {voiceInfo.voicePlan}
        </span>
      </div>

      <div className="space-y-1 mt-2">
        {activeService === "voice" ? (
          <>
            {/* <div className="flex justify-between text-xs">
              <span className="text-gray-400">Price:</span>
              <span className="font-medium text-white">
                {currentAiPlan
                  ? `$${(currentAiPlan.cost / 100).toFixed(2)}/mo`
                  : "$0/mo"}
              </span>
            </div> */}
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Remaining</span>
              <span className="font-medium text-white">
                {currentAiPlan?.total_minutes_balance || "0"}
                <span className="text-gray-400"> min</span>
              </span>
            </div>
            <div className="flex items-center text-xs mt-2">
              <Check className="h-3 w-3 text-accent-teal mr-1" />
              <span className="text-gray-400">AI voice agents</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Price:</span>
              <span className="font-medium text-white">
                ${currentPlan ? (currentPlan.cost / 100).toFixed(2) : "0"}/mo
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Monthly Chats:</span>
              <span className="font-medium text-white">
                {currentPlan?.messages_quota_user?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex items-center text-xs mt-2">
              <Check className="h-3 w-3 text-accent-teal mr-1" />
              <span className="text-gray-400">
                {currentPlan?.number_of_chatbots || "0"} chatbots included
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs font-medium text-accent-teal hover:underline">
          Upgrade Plan
        </span>
      </div>
    </Link>
  );
};

export default PricingPlan;

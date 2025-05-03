import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Check, Clock } from "lucide-react";

const VoicePlanCard = ({
  title,
  price,
  minutes,
  features,
  isPopular,
  isCurrentPlan,
  onSelect,
}) => {
  return (
    <div
      className={`glass-panel relative p-6 flex flex-col h-full transition-all duration-300 
      bg-gradient-to-br hover:from-glass-panel-light/20 hover:to-accent-teal/10
      ${
        isPopular
          ? "border-accent-teal ring-1 ring-accent-teal/30"
          : "border-subtle-border"
      }
      ${isCurrentPlan ? "bg-gradient-to-br from-accent-teal/5 to-black" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-teal px-4 py-1 rounded-full text-xs font-medium text-black">
          Popular
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-3 bg-yellow-500/90 px-3 py-1 rounded-full text-xs font-medium text-black flex items-center">
          <Crown className="w-3 h-3 mr-1" />
          Current
        </div>
      )}

      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-sm text-gray-400 ml-2">/month</span>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-300">
          <Clock className="w-4 h-4 mr-2 text-accent-teal" />
          {minutes.toLocaleString()} minutes
        </div>
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-accent-teal flex-shrink-0 mr-2" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        className={`w-full mt-auto ${
          isPopular ? "bg-accent-teal text-black hover:bg-accent-teal/90" : ""
        }`}
        variant={isCurrentPlan ? "outline" : "default"}
      >
        {isCurrentPlan ? "Current Plan" : "Select Plan"}
        {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
};

export default VoicePlanCard;

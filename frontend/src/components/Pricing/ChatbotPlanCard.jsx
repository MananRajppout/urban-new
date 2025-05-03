import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, ArrowRight, Grid3X3, Info } from "lucide-react";

const ChatbotPlanCard = ({
  name,
  price,
  messages,
  chatbots,
  characters,
  features =[],
  isCurrentPlan,
  index,
  onSelect,
}) => {
  const getAccentColor = (idx) => {
    switch (idx % 3) {
      case 0:
        return "accent-teal";
      case 1:
        return "accent-purple";
      case 2:
        return "accent-cyan";
      default:
        return "accent-teal";
    }
  };

  const accentColor = getAccentColor(index);

  return (
    <div
      className={`
        relative bg-black aspect-[3/2] p-6 flex flex-col rounded-xl border 
        transition-all duration-300 backdrop-blur-md
        ${
          isCurrentPlan
            ? "border-accent-teal bg-gradient-to-br from-accent-teal/20 to-black/90"
            : `border-subtle-border hover:border-${accentColor}/60`
        }
        hover:bg-gradient-to-br 
        ${
          index === 0
            ? "hover:from-accent-teal/20 hover:to-accent-cyan/5"
            : index === 1
            ? "hover:from-accent-purple/20 hover:to-accent-teal/5"
            : "hover:from-accent-cyan/20 hover:to-accent-purple/5"
        }
        group
      `}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 right-3 bg-yellow-500/90 px-3 py-1 rounded-full text-xs font-medium text-black flex items-center">
          <Crown className="w-3 h-3 mr-1" />
          Current
        </div>
      )}

      {index === 1 && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-teal/90 px-4 py-1 rounded-full text-xs font-semibold text-black">
          Most Popular
        </div>
      )}

      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-lg text-white mb-0">{name}</h3>
        {index === 0 ? (
          <div className="w-8 h-8 rounded-full bg-accent-teal/10 flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-accent-teal" />
          </div>
        ) : index === 1 ? (
          <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-accent-purple" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent-cyan/10 flex items-center justify-center">
            <Info className="w-4 h-4 text-accent-cyan" />
          </div>
        )}
      </div>

      <div className="text-2xl font-bold mb-4">
        {price}
        <span className="text-sm text-gray-400 ml-1">/month</span>
      </div>

      <div className="space-y-2 mb-2 text-sm">
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center
            ${
              index === 0
                ? "bg-accent-teal/20"
                : index === 1
                ? "bg-accent-purple/20"
                : "bg-accent-cyan/20"
            }`}
          >
            <Check
              className={`w-3 h-3 
              ${
                index === 0
                  ? "text-accent-teal"
                  : index === 1
                  ? "text-accent-purple"
                  : "text-accent-cyan"
              }`}
            />
          </div>
          <span className="text-white group-hover:text-gray-200">
            {messages.toLocaleString()} message credits
          </span>
        </div>
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center
            ${
              index === 0
                ? "bg-accent-teal/20"
                : index === 1
                ? "bg-accent-purple/20"
                : "bg-accent-cyan/20"
            }`}
          >
            <Check
              className={`w-3 h-3 
              ${
                index === 0
                  ? "text-accent-teal"
                  : index === 1
                  ? "text-accent-purple"
                  : "text-accent-cyan"
              }`}
            />
          </div>
          <span className="text-white group-hover:text-gray-200">
            {chatbots} chatbot{chatbots > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center
            ${
              index === 0
                ? "bg-accent-teal/20"
                : index === 1
                ? "bg-accent-purple/20"
                : "bg-accent-cyan/20"
            }`}
          >
            <Check
              className={`w-3 h-3 
              ${
                index === 0
                  ? "text-accent-teal"
                  : index === 1
                  ? "text-accent-purple"
                  : "text-accent-cyan"
              }`}
            />
          </div>
          <span className="text-white group-hover:text-gray-200">
            {characters} characters/bot
          </span>
        </div>
      </div>

      <div className="flex-grow overflow-auto my-2 text-xs text-gray-400 border-t border-gray-800 pt-2 max-h-16 scrollbar-none">
        <ul className="space-y-1">
          {features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <Check
                className={`w-3 h-3 flex-shrink-0 mr-1 mt-0.5
                ${
                  index === 0
                    ? "text-accent-teal"
                    : index === 1
                    ? "text-accent-purple"
                    : "text-accent-cyan"
                }`}
              />
              <span>{feature}</span>
            </li>
          ))}
          {features.length > 3 && (
            <li className="text-center mt-1 italic">
              + {features.length - 3} more features
            </li>
          )}
        </ul>
      </div>

      <Button
        className={`w-full mt-auto transition-colors text-sm py-1 h-auto
          ${
            isCurrentPlan
              ? "border-accent-teal text-accent-teal hover:bg-accent-teal/10"
              : ""
          }
          ${
            !isCurrentPlan && index === 0
              ? "bg-accent-teal hover:bg-accent-teal/90 text-black"
              : ""
          }
          ${
            !isCurrentPlan && index === 1
              ? "bg-accent-purple hover:bg-accent-purple/90 text-white"
              : ""
          }
          ${
            !isCurrentPlan && index === 2
              ? "bg-accent-cyan hover:bg-accent-cyan/90 text-black"
              : ""
          }
        `}
        variant={isCurrentPlan ? "outline" : "default"}
        onClick={onSelect}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? "Current Plan" : "Select Plan"}
        {!isCurrentPlan && <ArrowRight className="w-3 h-3 ml-1" />}
      </Button>
    </div>
  );
};

export default ChatbotPlanCard;

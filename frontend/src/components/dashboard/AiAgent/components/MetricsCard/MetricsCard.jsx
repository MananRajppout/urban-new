import React from "react";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import { getSentimentColor } from "../../utils/helper";

const MetricsCard = ({
  title,
  value,
  trend,
  icon,
  isPercentage = false,
  isPositiveTrend = true,
  isSentiment = false,
  infoTooltip,
  breakdown=[]
}) => {
  return (
    <div className="cursor-pointer glass-panel py-5 px-5 duration-300  hover:shadow-xl hover:shadow-glass-panel-light ">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
            {infoTooltip && (
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-3.5 w-3.5 mt-3" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {infoTooltip}
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`text-2xl font-semibold ${getSentimentColor(
                value,
                isSentiment
              )}`}
            >
              {isPercentage ? `${value}%` : value}
            </span>
            <div
              className={`flex items-center text-xs font-medium ${
                isPositiveTrend
                  ? "text-sentiment-positive"
                  : "text-sentiment-negative"
              }`}
            >
              {isPositiveTrend ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {trend}%
            </div>
          </div>
          {breakdown.length > 0 && ( // Render breakdown if provided
            <div className="mt-2 text-xs font-normal text-gray-300">
              {breakdown.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {isSentiment && (
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  parseInt(value.toString()) >= 75
                    ? "bg-sentiment-positive/20 text-sentiment-positive"
                    : parseInt(value.toString()) >= 40
                    ? "bg-sentiment-neutral/20 text-sentiment-neutral"
                    : "bg-sentiment-negative/20 text-sentiment-negative"
                }`}
              >
                {parseInt(value.toString()) >= 75
                  ? "Positive"
                  : parseInt(value.toString()) >= 40
                  ? "Neutral"
                  : "Negative"}
              </span>
            </div>
          )}
        </div>
        <div className="text-accent-teal">{icon}</div>
      </div>
    </div>
  );
};

export default MetricsCard;
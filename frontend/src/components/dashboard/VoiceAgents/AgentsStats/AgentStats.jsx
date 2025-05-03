import React from "react";
import { ArrowUpRight, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../AiAgent/components/Popover/Popover";

const AgentStats = ({
  totalAgents,
  availableAgents,
  onCallAgents,
  avgSentiment,
}) => {
  const tooltips = {
    totalAgents: "Total number of AI voice agents created in your account.",
    availableAgents:
      "Agents ready to take calls and not currently engaged with a caller.",
    onCallAgents: "Agents currently engaged in active calls with users.",
    avgSentiment:
      "Average sentiment score across all calls, calculated by analyzing call transcripts. Scores above 75% are considered positive.",
  };

  return (
    <div className="glass-panel p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-lg font-medium text-white">
          Agent Overview
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="glass-panel-light/20 py-1 px-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-400">
                Total Agents
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {tooltips.totalAgents}
                </PopoverContent>
              </Popover>
            </div>
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-white mt-0">
            {totalAgents}
          </p>
        </div>

        <div className="glass-panel-light/20 py-1 px-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-400">
                Available Now
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {tooltips.availableAgents}
                </PopoverContent>
              </Popover>
            </div>
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-white mt-0">
            {availableAgents}
          </p>
        </div>

        <div className="glass-panel-light/20 py-1 px-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-400">
                On Call
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {tooltips.onCallAgents}
                </PopoverContent>
              </Popover>
            </div>
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-white mt-0">
            {onCallAgents}
          </p>
        </div>

        <div className="glass-panel-light/20 py-1 px-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-400">
                Avg. Sentiment
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-3.5 w-3.5" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {tooltips.avgSentiment}
                </PopoverContent>
              </Popover>
            </div>
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          </div>
          <p className="text-xl md:text-2xl font-semibold text-sentiment-positive mt-0">
            {avgSentiment}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentStats;

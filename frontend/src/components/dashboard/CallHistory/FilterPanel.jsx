import React, { useState } from "react";
import {
  Filter,
  Calendar,
  User,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calender";

import { format } from "date-fns";
import { Button } from "../AiChatBot/components/button/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../AiAgent/components/Popover/Popover";

const FilterPanel = ({ expanded, setExpanded, applyFilters, clearFilters }) => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="glass-panel py-2 px-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-accent-teal" />
          <h3 className="text-white font-medium">Filters</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-accent-teal cursor-pointer text-sm bg-transparent border border-none rounded-md px-4 py-2 hover:underline focus:outline-none"
        >
          {expanded ? "Collapse Filters" : "Expand Filters"}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="glass-panel border border-subtle-border rounded-md w-full px-4 py-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-300">
                      {date ? format(date, "PPP") : "Select date"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-panel" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto bg-background"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Agent
            </label>
            <div className="relative">
              <div className="glass-panel border border-subtle-border rounded-md px-4 py-2 flex items-center space-x-2 cursor-pointer">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">All Agents</span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <div className="relative">
              <div className="glass-panel border border-subtle-border rounded-md px-4 py-2 flex items-center space-x-2 cursor-pointer">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">All Statuses</span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="glass-panel border border-subtle-border rounded-md pl-10 pr-4 py-2 w-full text-sm text-gray-300 focus:border-accent-teal focus:outline-none"
                placeholder="Search caller ID, transcripts..."
              />
            </div>
          </div>

          <div className="flex items-end space-x-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-none bg-accent-teal text-black rounded-md text-sm font-medium hover:bg-accent-teal/90 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 glass-panel-light border border-subtle-border text-gray-300 rounded-md text-sm hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

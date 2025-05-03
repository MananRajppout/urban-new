"use client";

import React from "react";
import { useRouter } from "next/router";
import { PhoneCall, MessageSquare, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ServiceSelector = ({ activeService, setActiveService }) => {
  const router = useRouter();

  const handleServiceChange = (service) => {
    setActiveService(service);
    if (service === "voice") {
      router.push("/ai-voice-agent");
    } else {
      router.push("/ai-chatbot");
    }
  };

  return (
    <DropdownMenu>
      {/* comment drop down temporaroy later on uncommnet this code simply  */}
      {/* <DropdownMenuTrigger className="w-full bg-transparent border-none"> */}
        <button className="border-none w-full flex items-center justify-between py-3 px-6 transition-all duration-200 group rounded-md border-l-3 border-accent-teal bg-glass-panel/40">
          <div className="flex items-center cursor-pointer">
            {activeService === "voice" ? (
              <PhoneCall className="w-5 h-5 mr-3 text-accent-teal" />
            ) : (
              <MessageSquare className="w-5 h-5 mr-3 text-accent-teal" />
            )}
            <span className="text-sm font-medium text-white">
              {activeService === "voice" ? "AI Voice Agent" : "AI Chatbot"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-accent-teal" />
        </button>
      {/* </DropdownMenuTrigger> */}
      <DropdownMenuContent className="w-56 glass-panel border border-subtle-border">
        {/* {activeService === "voice" ? (
          <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => handleServiceChange("chatbot")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>AI Chatbot</span>
          </DropdownMenuItem>
        ) : ( */}
          {/* <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => handleServiceChange("voice")}
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            <span>AI Voice Agent</span>
          </DropdownMenuItem> */}
        {/* )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServiceSelector;

import VoiceCaller from "@/Utils/webCall";
import { hangUpWebCall } from "@/Utils/webCallHandler";
import React, { useEffect, useRef } from "react";

const CallScreen = ({ onClose, agentId }) => {
  const voiceCallRef = useRef(null);
  useEffect(() => {
    const currentAgentId = agentId || process.env.NEXT_PUBLIC_DEMO_AGENT_ID;
    voiceCallRef.current = new VoiceCaller(currentAgentId);
    voiceCallRef.current.on("onCallEnd", () => {
      handleHangUpCall();
    });
    voiceCallRef.current.call();
  }, []);
  const handleHangUpCall = async () => {
    // hangUpWebCall();
    onClose();
    console.log("close");
    await voiceCallRef.current?.stop();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-zinc-700 bg-opacity-80 p-8 rounded-lg shadow-lg text-white max-w-sm w-full text-center">
        <div className="mb-8">
          <svg
            className="w-16 h-16 text-red-500 inline-block animate-spin-slow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-5 8H3m18 0h-8m8 0a9 9 0 01-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold mb-4">
          In Call with AI Assistant....
        </p>
        <button
          className="bg-red-500 font-semibold hover:bg-red-600 border-none text-white px-4 py-2 rounded-lg "
          onClick={handleHangUpCall}
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default CallScreen;

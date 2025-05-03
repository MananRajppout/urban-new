import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestAgentDialog from "./TestAgentDialog";
import useVoiceInfo from "@/hooks/useVoice";

const AgentHeader = ({
  isNewAgent,
  agentId,
  agentName,
  setAgentName,
  testDialogOpen,
  setTestDialogOpen,
}) => {
  const voiceInfo = useVoiceInfo();
  return (
    <>
      {/* Header with back button */}
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/voice-agents" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-medium text-white">
          {isNewAgent ? "Create New AI Agent" : "Edit AI Agent"}
        </h1>
      </div>

      {/* Agent ID and Name */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Agent ID
              </label>
              <input
                type="text"
                value={agentId}
                disabled
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-glass-panel-light/10 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={!voiceInfo.isVoiceAiActive}
              onClick={() => setTestDialogOpen(true)}
              className="px-4 py-2 cursor-pointer border border-none bg-accent-teal text-black font-medium hover:bg-accent-teal/90"
            >
              Test Agent
            </Button>
            {
              testDialogOpen && (
                <TestAgentDialog
                  open={testDialogOpen}
                  onOpenChange={setTestDialogOpen}
                  agentName={agentName}
                  agentId={agentId}
                />
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentHeader;

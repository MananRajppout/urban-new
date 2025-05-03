import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import AgentStats from "@/components/dashboard/VoiceAgents/AgentsStats/AgentStats";
import { Plus, LoaderIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/dashboard/AiChatBot/components/button/Button";
import { useRouter } from "next/router";
import VoiceAgentTable from "@/components/dashboard/VoiceAgents/Table/VoiceAgentTable";
import useSWR, { mutate } from "swr";
import { fetchAiAgents, createAiAgent } from "@/lib/api/ApiAiAssistant";
import { toast } from "react-hot-toast";
import useVoiceInfo from "@/hooks/useVoice";

const transformAgentData = (apiAgents) => {
  return apiAgents.map((agent) => ({
    id: agent._id,
    name: agent.name,
    role: agent.voice_name || "AI Agent",
    callsHandled: Math.floor(Math.random() * 150) + 50,
    avgDuration: `${Math.floor(Math.random() * 6) + 2}:${Math.floor(
      Math.random() * 60
    )
      .toString()
      .padStart(2, "0")}`,
    sentimentScore: Math.floor(Math.random() * 30) + 70,
    conversionRate: Math.floor(Math.random() * 30) + 40,
    availability: agent.privacy_setting === "public" ? "Available" : "Offline",
    language: agent.language || "en",
    model: agent.chatgpt_model || "gpt-4",
  }));
};

const Agents = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const agentsKey = "/api/fetch-ai-agents";

  const { data, error, isLoading } = useSWR(agentsKey, fetchAiAgents, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });
  const voiceInfo = useVoiceInfo();

  const handleNewSingleAgent = () => {
    router.push("/agents/new");
  };

  const handleNewFlowAgent = () => {
    router.push("/agents/flow-new");
  };

  const handleCreateQuickAgent = async () => {
    try {
      setIsCreating(true);
      const newAgent = await createAiAgent();
      console.log("New agent created:", newAgent);
      mutate(agentsKey);
      toast.success("Agent created successfully!");
      router.push("/voice-agents/" + newAgent?.data?.data?._id);
    } catch (error) {
      toast.error(error.message || "Failed to create agent. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const agents = data ? transformAgentData(data?.data?.ai_agents || []) : [];

  const totalAgents = agents?.length;
  const availableAgents = agents?.filter(
    (agent) => agent.availability === "Available"
  ).length;
  const onCallAgents = agents?.filter(
    (agent) => agent.availability === "On Call"
  ).length;
  const avgSentiment =
    agents?.length > 0
      ? Math.round(
          agents?.reduce((sum, agent) => sum + agent.sentimentScore, 0) /
            agents?.length
        )
      : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoaderIcon className="w-8 h-8 animate-spin text-accent-teal" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh] flex-col">
          <p className="text-red-500 mb-2">Error loading agents data</p>
          <button
            className="px-4 py-2 bg-accent-teal text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl font-medium text-white">Agent Management</h1>

        
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="border border-none cursor-pointer flex items-center justify-center px-4 py-2 bg-accent-teal text-black rounded-md text-sm font-medium hover:bg-accent-teal/90 transition-colors w-full sm:w-auto"
                  disabled={isCreating || !voiceInfo.isVoiceAiActive}
                  onClick={handleCreateQuickAgent}
                >
                  {isCreating ? (
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add New Agent
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
        </div>

        {/* <AgentStats
          totalAgents={totalAgents}
          availableAgents={availableAgents}
          onCallAgents={onCallAgents}
          avgSentiment={avgSentiment}
        /> */}

        <VoiceAgentTable data={agents} mutateKey={agentsKey} />
      </div>
    </Layout>
  );
};

export default Agents;

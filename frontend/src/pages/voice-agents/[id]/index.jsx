import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import ModelSelection from "@/components/dashboard/VoiceAgents/UpdateAgents/ModelSelection";
import AgentHeader from "@/components/dashboard/VoiceAgents/UpdateAgents/AgentHeader";
import PromptAndSettingsSection from "@/components/dashboard/VoiceAgents/UpdateAgents/PromptAndSettingsSection";
import IntegrationsSection from "@/components/dashboard/VoiceAgents/UpdateAgents/IntegrationsSection";
import useSWR from "swr";
import {
  fetcherAiAgent,
  saveCalAvailabilitySettings,
  saveCalBookingSettings,
  updateAiAgent,
} from "@/lib/api/ApiAiAssistant";
import { Loader2 } from "lucide-react";
import debounce from "lodash.debounce";
import { CanceledError } from "axios";
import useVoiceInfo from "@/hooks/useVoice";
import AxiosInstance from "@/lib/axios";

const AgentDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: agentData,
    error,
    isLoading,
    mutate,
  } = useSWR(id ? id : null, fetcherAiAgent);
  const abortControllerRef = useRef(null);
  const voiceInfo = useVoiceInfo();

  const userSwr = useSWR("/api/fetch-user-details", AxiosInstance.get);
  const userData = userSwr.data?.data?.user || {};
  console.log("userData", userData.elevenlabs_api_key);

  const [agent, setAgent] = useState({
    name: "",
    _id: "",
    voice_name: "",
    voice_id: "",
    STT_name: "",
    chatgpt_model: "",
    voice_engine_name: "",
    voice_speed: 1.0,
    similarity: 0.7,
    voice_temperature: 0.7,
    ambient_sound: "none",
    ambient_sound_volume: 0.3,
    who_speaks_first: "ai",
    elevenlabs_api_key: "",

    // cal
    isCalConnected: false,
    isBookingConnected: false,
    calApiKey: "",
    calEventId: "",
    calTimeZone: "",
    bookingName: "",
    bookingApiKey: "",
    bookingTypeId: "",
    bookingTimeZone: "",
    calName: "availability",
    welcome_message_text: "Hello' How can i assist you today.",
    silence_1_timeout: 15,
    silence_2_timeout: 15,
    silence_1_speech: "You are here.",
    silence_2_speech: "Thank's you for calling.",
  });

  const [prompt, setPrompt] = useState({
    old: "",
    new: "",
  });

  const [welcomeMessage, setWelcomeMessage] = useState({
    old: "",
    new: "",
  });

  //hangup prompt
  const [hangUpPromt, setHangUpPromt] = useState({
    old: "",
    new: "",
  });

  const [testDialogOpen, setTestDialogOpen] = useState(false);

  const [isCalLoading, setIsCalLoading] = useState(false);

  useEffect(() => {
    if (agentData && agentData.ai_agents) {
      const agent = agentData.ai_agents;
      setAgent({
        name: agent.name || "",
        _id: agent._id || "",
        voice_name: agent.voice_name || "Devi",
        voice_id: agent.voice_id || "",
        STT_name: agent.STT_name || "",
        chatgpt_model: agent.chatgpt_model || "",
        voice_engine_name: agent.voice_engine_name || "",
        voice_speed: agent.voice_speed || 1.0,
        voice_temperature: agent.voice_temperature || 0.7,
        ambient_sound: agent.ambient_sound || "none",
        ambient_sound_volume: agent.ambient_sound_volume || 0.3,
        who_speaks_first: agent.who_speaks_first || "ai",
        elevenlabs_api_key: agent.elevenlabs_api_key || "",
        // cal
        isCalConnected: !!agent.calendar_tools?.[0]?.AvailabilityCalapiKey,
        calApiKey: agent.calendar_tools?.[0]?.AvailabilityCalapiKey || "",
        calEventId: agent.calendar_tools?.[0]?.AvailabilityCaleventTypeId || "",
        calTimeZone:
          agent.calendar_tools?.[0]?.AvailabilityCaltimezone || "America/Los_Angeles",
        bookingName: agent.calender_booking_tool?.[0]?.bookingName || "booking",
        bookingApiKey: agent.calender_booking_tool?.[0]?.bookingApiKey || "",
        bookingTypeId: agent.calender_booking_tool?.[0]?.bookingTypeId || "",
        bookingTimeZone:
          agent.calender_booking_tool?.[0]?.bookingTimeZone || "Asia/Kolkata",
        calName: agent.calendar_tools?.[0]?.name || "availability",
        isBookingConnected: !!agent.calender_booking_tool?.[0]?.bookingApiKey,

        silence_1_timeout: agent.silence_1_timeout || 15,
        silence_2_timeout: agent.silence_2_timeout || 15,
        silence_1_speech: agent.silence_1_speech || "You are here.",
        silence_2_speech: agent.silence_2_speech || "Thank's you for calling.",
   
      });
      setPrompt({
        old: agent.base_prompt || "",
        new: agent.base_prompt || "",
      });

      setWelcomeMessage({
        new: agent.welcome_message_text || "Hello' How can i assist you today.",
        old: agent.welcome_message_text || "Hello' How can i assist you today.",
      });
      setHangUpPromt({
        new:
          agent.hang_up_prompt ||
          "When the user say goodbye.",
        old:
          agent.hang_up_prompt ||
          "When the user say goodbye.",
      });
    }
  }, [agentData]);

  const handleFieldChange = (field, value, save = true) => {
    setAgent((prev) => ({ ...prev, [field]: value }));
    if (save) debouncedUpdateAgent({ [field]: value });
  };

  const handleFieldsChange = (obj) => {
    setAgent((prev) => ({ ...prev, ...obj }));
    debouncedUpdateAgent(obj);
  };

  const debouncedUpdateAgent = debounce(async (updatedAgent) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const response = await updateAiAgent(agent._id, updatedAgent, {
      signal: abortController.signal,
    });

    if (response.error?.name === "CanceledError") return;
    if (response.error) {
      toast.error(response.data.message || "Failed to update agent");
      return;
    }
    // mutate();
  }, 800);

  const handleSavePrompt = async () => {
    try {
      const updatedAgent = {
        base_prompt: prompt.new,
        welcome_message_text: welcomeMessage.new,
        hang_up_prompt: hangUpPromt.new,
      };
      const res = await updateAiAgent(agent._id, updatedAgent);
      if (res.error) {
        toast.error(res.error.message || "Failed to save prompt");
        return;
      }
      setPrompt((prev) => ({ ...prev, old: prompt.new }));
      toast.success("Prompt saved successfully!");
      mutate();
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save prompt");
    }
  };

  const handleRevertPrompt = () => {
    setPrompt((prev) => ({ ...prev, new: prev.old }));
  };

  const handleConnectCal = async () => {
    const { calApiKey, calEventId, calTimeZone, calName, _id: agentId } = agent;

    if (!calApiKey || !calEventId || !calTimeZone || !calName) {
      return toast.error("Please fill in all availability fields");
    }

    try {
      setIsCalLoading(true);
      const formData = {
        agentId,
        Availabilityname: calName,
        AvailabilityCalapiKey: calApiKey,
        AvailabilityCaleventTypeId: calEventId,
        AvailabilityCaltimezone: calTimeZone,
      };
      const response = await saveCalAvailabilitySettings(formData);
      if (response.data) {
        setAgent((prev) => ({ ...prev, isCalConnected: true }));
        toast.success("Cal.com availability connected successfully");
        mutate();
      } else {
        toast.error(
          response.data?.message || "Failed to connect Cal.com availability"
        );
      }
    } catch (error) {
      console.error("Error connecting Cal.com availability:", error);
      toast.error("Failed to connect Cal.com availability");
    } finally {
      setIsCalLoading(false);
    }
  };

  const handleConnectBooking = async () => {
    const {
      bookingName,
      bookingApiKey,
      bookingTypeId,
      bookingTimeZone,
      _id: agentId,
    } = agent;

    if (!bookingName || !bookingApiKey || !bookingTypeId || !bookingTimeZone) {
      return toast.error("Please fill in all booking fields");
    }

    try {
      setIsCalLoading(true);
      const formData = {
        agentId,
        bookingName,
        bookingApiKey,
        bookingTypeId,
        bookingTimeZone,
      };
      const response = await saveCalBookingSettings(formData);
      if (response.data) {
        setAgent((prev) => ({ ...prev, isBookingConnected: true }));
        toast.success("Cal.com booking connected successfully");
        mutate();
      } else {
        toast.error(
          response.data?.message || "Failed to connect Cal.com booking"
        );
      }
    } catch (error) {
      console.error("Error connecting Cal.com booking:", error);
      toast.error("Failed to connect Cal.com booking");
    } finally {
      setIsCalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-sentiment-negative">
              Error loading agent data. Please try again.
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <AgentHeader
          agentId={agent._id}
          agentName={agent.name}
          setAgentName={(value) => handleFieldChange("name", value)}
          testDialogOpen={testDialogOpen}
          setTestDialogOpen={(value) => setTestDialogOpen(value)}
        />
        <div className="space-y-6">
          <ModelSelection
            sttModel={agent.STT_name}
            setSTTModel={(value) => handleFieldChange("STT_name", value)}
            llmModel={agent.chatgpt_model}
            setLLMModel={(value) => handleFieldChange("chatgpt_model", value)}
            ttsModel={agent.voice_engine_name}
            setTTSModel={(value) =>
              handleFieldChange("voice_engine_name", value)
            }
            voice={agent.voice_name}
            voiceId={agent.voice_id}
            setVoice={(value) => {
              handleFieldsChange({
                voice_name: value.voice_name,
                voice_id: value.voice_id,
                voice_engine_name: value.voice_engine_name,
              });
            }}
            whoSpeaksFirst={agent.who_speaks_first}
            setWhoSpeaksFirst={(value) =>
              handleFieldChange("who_speaks_first", value)
            }
            elevenlabs_api_key={userData.elevenlabs_api_key}
            setElevenLabsApiKey={async (value) => {
              await AxiosInstance.post("/api/edit-user", {
                elevenlabs_api_key: value,
              });
              await userSwr.mutate();
            }}
          />
          <PromptAndSettingsSection
            agentId={agent._id}
            prompt={prompt}
            setPrompt={(value) => {
              setPrompt((prev) => ({ ...prev, new: value }));
            }}
            handleRevertPrompt={handleRevertPrompt}
            handleSavePrompt={handleSavePrompt}
            backgroundSound={agent.ambient_sound}
            setBackgroundSound={(value) =>
              handleFieldChange("ambient_sound", value)
            }
            backgroundVolume={agent.ambient_sound_volume}
            handleVolumeChange={(value) =>
              handleFieldChange("ambient_sound_volume", value[0])
            }
            voiceSpeed={agent.voice_speed}
            handleVoiceSpeedChange={(value) =>
              handleFieldChange("voice_speed", value[0])
            }
            temperature={agent.voice_temperature}
            handleTemperatureChange={(value) =>
              handleFieldChange("voice_temperature", value[0])
            }
            welcome_message_text={welcomeMessage}
            handleWelcomeMessageChange={(value) =>
              setWelcomeMessage((prev) => ({ ...prev, new: value }))
            }
            hangUpPromt={hangUpPromt}
            handlehangUpPromtChange={(value) =>
              setHangUpPromt((prev) => ({ ...prev, new: value }))
            }
            silence_1_timeout={agent.silence_1_timeout}
            set_silence_1_timeout={(value) =>
              handleFieldChange("silence_1_timeout", value[0])
            }
            silence_2_timeout={agent.silence_2_timeout}
            set_silence_2_timeout={(value) =>
              handleFieldChange("silence_2_timeout", value[0])
            }
            silence_1_speech={agent.silence_1_speech}
            set_silence_1_speech={(value) =>
              handleFieldChange("silence_1_speech", value[0])
            }
            silence_2_speech={agent.silence_2_speech}
            set_silence_2_speech={(value) =>
              handleFieldChange("silence_2_speech", value[0])
            }
          />

          <IntegrationsSection
            agent={agent}
            calApiKey={agent.calApiKey}
            calEventId={agent.calEventId}
            isCalConnected={agent.isCalConnected}
            name={agent.calName}
            calTimeZone={agent.calTimeZone}
            bookingName={agent.bookingName}
            bookingApiKey={agent.bookingApiKey}
            bookingTypeId={agent.bookingTypeId}
            bookingTimeZone={agent.bookingTimeZone}
            isBookingConnected={agent.isBookingConnected}
            isLoading={isCalLoading}
            handleConnectCal={handleConnectCal}
            handleConnectBooking={handleConnectBooking}
            setName={(value) => {
              setAgent((prev) => ({ ...prev, calName: value }));
            }}
            setCalApiKey={(value) => {
              setAgent((prev) => ({ ...prev, calApiKey: value }));
            }}
            setCalEventId={(value) => {
              setAgent((prev) => ({ ...prev, calEventId: value }));
            }}
            setCalTimeZone={(value) => {
              setAgent((prev) => ({ ...prev, calTimeZone: value }));
            }}
            setBookingName={(value) =>
              setAgent((prev) => ({ ...prev, bookingName: value }))
            }
            setBookingApiKey={(value) =>
              setAgent((prev) => ({ ...prev, bookingApiKey: value }))
            }
            setBookingTypeId={(value) =>
              setAgent((prev) => ({ ...prev, bookingTypeId: value }))
            }
            setBookingTimeZone={(value) =>
              setAgent((prev) => ({ ...prev, bookingTimeZone: value }))
            }
          />
        </div>
      </div>
    </Layout>
  );
};

export default AgentDetail;

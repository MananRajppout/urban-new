import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import "@/styles/AiAssistant/agent2.css";
import CallScreen from "../../components/HomePage/CallScreen";
import aiAgentImg from "@/assets/add-agent.png";
import editIcon from "@/assets/Icons/edit-icon.svg";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { AiOutlineRobot } from "react-icons/ai";
import { RiDeleteBin5Fill } from "react-icons/ri";
import {
  createAiAgent,
  fetchAiAgents,
  fetchSingleAgent,
  updateAiAgent,
  deleteAiAgent,
} from "@/lib/api/ApiAiAssistant";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";
import SelectVoiceDialog from "@/components/Dialog/SelectVoicesDialog";
import AgentSettings from "@/components/ai-assistant/ai-agents/AgentSettings";
import { FaSortDown } from "react-icons/fa";
import Dropdown from "@/components/Widget/Dropdown";
import useVoiceInfo from "@/hooks/useVoice";
import Layout from "@/components/layout/Layout";

export default function AiAssistant() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [aiAgent, setAiAgent] = useState({});
  const [agentAdded, setAgentAdded] = useState(false);
  const [isClickedOnAgentName, setIsClickedOnAgentName] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [inCall, setInCall] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    base_prompt: "",
    chatgpt_model: "",
    STT_name: "",
    who_speaks_first: "",
    voice_id: "",
    welcome_msg: "",
    call_transfer_prompt: "",
    transfer_call_number: "",
  });

  //changes by aayussh stability similarity add stabiltiy similarity

  const [advancedSettings, setAdvancedSettings] = useState({
    voice_temperature: 0.5,
    voice_speed: 1,
    end_call_duration: 600,
    ambient_sound: "",
    ambient_sound_volume: 0.5,
    responsiveness: 0.5,
    interruption_sensitivity: 0.5,
    reminder_interval: 10,
    reminder_count: 1,
    boosted_keywords: "",
    fallback_voice_ids: "",
    enable_backchannel: false,
    language: "en-US (English - US)",
    agent_level_webhook_url: "",
    enable_speech_normalization: false,
    ambient_stability: 0.5,
    ambient_similarity: 0.5,
  });
  const [privacySettings, setPrivacySettings] = useState({
    privacy_setting: "public",
  });

  const [isChanged, setIsChanged] = useState(false);
  const [isAdvancedChanged, setIsAdvancedChanged] = useState(false);
  const [isPrivacyChanged, setIsPrivacyChanged] = useState(false);
  const [showToolPopup, setShowToolPopup] = useState(false);
  const [calendarTools, setCalendarTools] = useState([]);

  async function addAgent() {
    const res = await createAiAgent();
    if (res.data) {
      setAgentAdded(true);
      toast.success("Agent added successfully");
    } else {
      toast.error("Failed to add agent");
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteAiAgent(id);

      if (res.data) {
        toast.success("Agent deleted successfully");

        const remainingAgents = agents.filter((agent) => agent._id !== id);
        setAgents(remainingAgents);

        if (remainingAgents.length > 0) {
          await router.replace({
            pathname: router.pathname,
            query: { agentId: remainingAgents[0]._id },
          });
          setSelectedAgentId(remainingAgents[0]._id);
          getSingleAgent(remainingAgents[0]._id);
        } else {
          setSelectedAgentId(null);
          await router.replace(router.pathname);
        }
      } else {
        toast.error("Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("An error occurred while deleting the agent");
    }
  };

  async function getAgents() {
    const res = await fetchAiAgents();
    if (res.data) {
      const respondedAgents = res?.data?.ai_agents;
      setAgents(respondedAgents);

      const agentId = router.query.agentId;

      if (agentId) {
        setSelectedAgentId(agentId);
        getSingleAgent(agentId);
      } else if (respondedAgents.length > 0) {
        const firstAgentId = respondedAgents[0]._id;
        setSelectedAgentId(firstAgentId);
        getSingleAgent(firstAgentId);
      }
    } else {
      toast.error("Failed to fetch agents");
    }
  }

  async function getSingleAgent(agentId) {
    setSelectedAgentId(agentId);
    const res = await fetchSingleAgent(agentId);
    console.log("agent", res.data);
    if (res.data) {
      const agentData = res.data.ai_agents;
      setAiAgent(agentData);
      setFormData({
        name: agentData?.name || "",
        base_prompt: agentData?.base_prompt || "",
        chatgpt_model: agentData?.chatgpt_model || "",
        STT_name: agentData?.STT_name || "",
        who_speaks_first: agentData?.who_speaks_first || "",
        voice_id: agentData?.voice_id || "",
        welcome_msg: agentData?.welcome_msg || "",
        call_transfer_prompt: agentData?.call_transfer_prompt || "",
        transfer_call_number: agentData?.transfer_call_number || "",
      });

      //changes by aayussh stability similarity //
      setAdvancedSettings({
        ambient_stability: agentData.ambient_stability || 0.5,
        ambient_similarity: agentData.ambient_similarity || 0.5,
        voice_temperature: agentData.voice_temperature || 0.5,
        voice_speed: agentData.voice_speed || 1,
        end_call_duration: agentData.end_call_duration || 600,
        ambient_sound: agentData.ambient_sound || "",
        ambient_sound_volume: agentData.ambient_sound_volume || 1.0,
        responsiveness: agentData.responsiveness || 1.0,
        interruption_sensitivity: agentData.interruption_sensitivity || 1.0,
        reminder_interval: agentData.reminder_interval || 10,
        reminder_count: agentData.reminder_count || 1,
        boosted_keywords: agentData.boosted_keywords || "",
        fallback_voice_ids: agentData.fallback_voice_ids || "",
        enable_backchannel: agentData.enable_backchannel || false,
        language: agentData.language || "en",
        agent_level_webhook_url: agentData.agent_level_webhook_url || "",
        enable_speech_normalization:
          agentData.enable_speech_normalization || false,
      });

      setPrivacySettings({
        privacy_setting: agentData.privacy_setting || false,
      });

      setCalendarTools(agentData.calendar_tools || []);
      setIsChanged(false); // Reset the change state when a new agent is loaded
    } else {
      toast.error("Failed to fetch agent details");
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getAgents();
    }
    setAgentAdded(false);
  }, [router.isReady, agentAdded]);

  useEffect(() => {
    if (selectedAgentId) {
      router.push({
        pathname: router.pathname,
        query: { agentId: selectedAgentId },
      });
    }
    setIsClickedOnAgentName(false);
  }, [selectedAgentId]);

  const debouncedUpdate = useCallback(
    debounce(async (updatedSettings) => {
      const res = await updateAiAgent(selectedAgentId, updatedSettings);
      if (res.data) {
        console.log("Settings updated successfully");
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    }, 500),
    [selectedAgentId]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsChanged(true);
  };

  const handleAdvancedChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle immediate update for non-text inputs
    if (type !== "text") {
      const updatedValue =
        type === "checkbox"
          ? checked
          : type === "range"
          ? parseFloat(value)
          : value;

      const updatedSettings = {
        ...advancedSettings,
        [name]: updatedValue,
      };

      setAdvancedSettings(updatedSettings);
      debouncedUpdate(updatedSettings); // Immediately call API for non-text inputs
    } else {
      // For text inputs, only update the state but don't call the API
      setAdvancedSettings({
        ...advancedSettings,
        [name]: value,
      });
      setIsAdvancedChanged(true);
    }
  };

  const handleAdvancedBlur = (e) => {
    const { name, value } = e.target;

    const updatedSettings = {
      ...advancedSettings,
      [name]: value,
    };

    debouncedUpdate(updatedSettings); // Call API when text input loses focus
  };

  const handleDropdownAdvancedChange = (name, value) => {
    const updatedSettings = { ...advancedSettings, [name]: value };
    setAdvancedSettings(updatedSettings);
    debouncedUpdate(updatedSettings);
    setIsAdvancedChanged(true);
  };

  const handlePrivacyChange = (e) => {
    const { checked } = e.target;
    const updatedSettings = { privacy_setting: checked ? "private" : "public" };
    setPrivacySettings(updatedSettings);
    debouncedUpdate(updatedSettings);
    setIsPrivacyChanged(true);
  };
  useEffect(() => {
    return () => {
      handleStopWebCall();
    };
  }, []);
  
  const handleMakeWebCall = async (agentId) => {
    setInCall(true); // Set inCall to true on making the call
  };
  async function handleStopWebCall() {
    setInCall(false);
  }

  const handleDropdownChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    setIsChanged(true);
  };

  const handleUpdateAgent = async (data) => {
    setAdvancedSettings((e) => ({ ...e, ...data }));
    debouncedUpdate(data);
  };

  const handleSubmit = async () => {
    // Check if there are any new calendar tools with empty required fields
    // const hasInvalidNewTool = calendarTools.some(
    //   (tool) => !tool.cal_api_key || !tool.cal_event_type_id
    // );

    // if (hasInvalidNewTool) {
    //   toast.error(
    //     "Please fill in both API Key and Event Type ID before saving."
    //   );
    //   return;
    // }

    const res = await updateAiAgent(selectedAgentId, {
      ...formData,
      calendar_tools: calendarTools, // Include calendar tools in the update
    });

    if (res.data) {
      toast.success("Agent updated successfully");
      setIsChanged(false); // Reset the change state after successful update
      setIsClickedOnAgentName(false);
      getAgents();
    } else {
      toast.error("Failed to update agent");
    }
  };

  const updateVoice = async (voice_id, voice_engine_name, voice_name) => {
    const res = await updateAiAgent(selectedAgentId, {
      voice_id,
      voice_engine_name,
      voice_name,
    });
    if (res.data) {
      toast.success("Agent updated successfully");
      getSingleAgent(selectedAgentId);
      setIsChanged(false); // Reset the change state after successful update
      setIsClickedOnAgentName(false);
      getAgents();
    } else {
      toast.error("Failed to update agent");
    }
  };

  const toggleToolPopup = () => {
    setShowToolPopup(!showToolPopup);
  };

  const handleDeleteCalendarTool = (index) => {
    const updatedTools = [...calendarTools];
    updatedTools.splice(index, 1);
    setCalendarTools(updatedTools);
    setIsChanged(true);
  };

  const handleCalendarToolChange = (index, key, value) => {
    const updatedTools = [...calendarTools];
    updatedTools[index] = { ...updatedTools[index], [key]: value };
    setCalendarTools(updatedTools);
    setIsChanged(true);
  };

  const addCalendarTool = () => {
    setCalendarTools([
      ...calendarTools,
      {
        cal_api_key: "",
        cal_event_type_id: "",
        cal_timezone: "",
      },
    ]);
    setShowToolPopup(false);
    setIsChanged(true);
  };

  /**
   * here i paste the code of the model option component for recreation
   */
  const modelOptions = [
    // { name: "GPT 3.5 Turbo", value: "gpt-3.5-turbo" },
    // { name: "GPT 4o Mini", value: "gpt-4o-mini" },
    // { name: "GPT 4o", value: "gpt-4o" },
    // { name: "GPT 4", value: "gpt-4" },
    // { name: "GPT 4 Turbo", value: "gpt-4-0125-preview" },
    // realtime

    { name: "GPT 4o Realtime", value: "gpt-4o-realtime-preview-2024-12-17" },
    // {
    //   name: "GPT 4o mini Realtime",
    //   value: "gpt-4o-mini-realtime-preview-2024-12-17",
    // },
    // {
    //   name: "Llama 3.2 1B (Preview) 8k", value: "Llama 3.2 1B (Preview) 8k"
    // }
  ];

  const STTOptions = [
    { name: "Deepgram Nova 3", value: "deepgram-nova-3" },
    // { name: "Groq Distil-Whisper", value: "groq-distil-whisper" },
    // { name: "Openai Whisper", value: "openai-whisper" },
  ];

  const whoSpeaksFirstOptions = [
    { name: "Ai", value: "ai" },
    { name: "Human", value: "human" },
  ];

  const tts_providers = [
    { name: "ElevenLabs", value: "elevenlabs" },
    { name: "Sarvam", value: "sarvam" },
    { name: "Smallest", value: "smallest" },
  ];

  const [isMainListVisible, setIsMainListVisible] = useState(true);

  const handleMainListClick = () => {
    setIsMainListVisible(false);
  };

  const handleBackButtonClick = () => {
    setIsMainListVisible(true);
  };

  const { isVoiceAiActive } = useVoiceInfo();
  

  return (
    <>
      {/* Main Layout Section */}
      {isMainListVisible ? (
        <Layout>
          {/* Audio Element for Playing Media */}
          <audio id="remoteMedia" autoPlay />

          <div style={{ width: "100%", height: "100%" }}>
            {/* Main List View */}
            <div className="">
              {/* Agent Icon Section */}
              {!isVoiceAiActive && (
                <div className="flex justify-center ">
                  <p className=" text-gray-300 max-w-md bg-gray-800 rounded-lg shadow-lg text-sm text-center p-2 m-0">
                    Your voice AI account is currently disabled. To request a
                    free trial, please email us at{" "}
                    <a
                      href="mailto:alex@urbanchat.ai"
                      className="text-blue-400 underline"
                    >
                      alex@urbanchat.ai
                    </a>
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between ">
                <div
                  className="flex items-center justify-start "
                  style={{ color: "#98A0AE" }}
                >
                  <AiOutlineRobot size={15} className="text-gray-400" />
                  <p className="font-semibold text-sm ml-2 text-gray-400">
                    Agent
                  </p>
                </div>

                {/* Add Agent Button */}
                <div className="">
                  <button
                    // disabled={!isVoiceAiActive}
                    className="agent-btn-container"
                    onClick={addAgent}
                  >
                    + Add agent
                  </button>
                </div>
              </div>

              {/* Agent Information Header */}
              <div className="agent_info font-medium mt-8 px-4">
                <p>Agent Name</p>
                <p>Agent ID</p>
                <p>Voice</p>
                <p>Delete</p>
              </div>

              {/* Agent List Section */}
              <div className="agent_details">
                <div className="overflow-hidden">
                  {agents?.map((agent) => (
                    <div
                      key={agent._id}
                      onClick={() => getSingleAgent(agent._id)}
                    >
                      <div
                        className="main_list"
                        onClick={() =>
                          handleMainListClick(agent.name, agent._id)
                        } // Keeps existing functionality
                      >
                        {/* Main Agent Details */}
                        <p onClick={() => getSingleAgent(agent._id)}>
                          {agent.name}
                        </p>
                        <p
                          className="text-gray-600"
                          onClick={() => getSingleAgent(agent._id)}
                        >
                          {agent._id}
                        </p>
                        <p
                          className=" border-white hover:scale-105 ease-in-out duration-200 cursor-pointer flex items-center gap-1 "
                          onClick={() => setIsOpen(true)}
                        >
                          {agent.voice_name}
                          <FaSortDown className="mb-1 ml-2" />
                        </p>
                        <button
                          className="dele_btn"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent click from propagating to parent div
                            handleDelete(agent._id);
                          }}
                        >
                          <RiDeleteBin5Fill
                            size={25}
                            className="text-red-500"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      ) : (
        // Detailed View for a Specific Agent
        <div>
          <div className="agentid-header">
            <div className="back-button" onClick={handleBackButtonClick}>
              <MdKeyboardArrowLeft />
            </div>
            <div className="agent-container1">
              <div className="agentname-container">
                {isClickedOnAgentName ? (
                  <div>
                    <input
                      id="custom-url"
                      style={{ width: "fit-content" }}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter agent instructions here."
                    />
                    <button className="fill-btn" onClick={handleSubmit}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex-start"
                    style={{ width: "fit-content", height: "20px" }}
                  >
                    <h5>{aiAgent.name}</h5>
                    <button
                      className="gray-btn1 hover"
                      onClick={() => setIsClickedOnAgentName(true)}
                    >
                      <Image
                        src={editIcon.src}
                        width={15}
                        height={15}
                        alt="Edit agent name"
                        title="Edit name"
                      />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <p
                  className="fade-text"
                  style={{ margin: 0, fontSize: "12px" }}
                >
                  Agent ID: {aiAgent._id}
                </p>
              </div>
            </div>
          </div>

          <div className="agent_conta2" style={{ paddingTop: "15px" }}>
            <main
              className="settings-container setting-container-copy"
              style={{ position: "relative", height: "100vh" }}
            >
              <div className="voice-gpt-containe">
                <div className="voice-container">
                  <p
                    className="info-text border-white hover:scale-105 ease-in-out duration-200 cursor-pointer flex justify-center gap-1 items-center"
                    onClick={() => setIsOpen(true)}
                  >
                    <b>Voice:</b> {aiAgent.voice_name}
                    <FaSortDown className="mb-1 ml-3" />
                  </p>
                  <SelectVoiceDialog
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    updateVoice={updateVoice}
                    voice_engine_name={aiAgent.voice_engine_name}
                  />
                </div>
                <Dropdown
                  items={tts_providers}
                  style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
                  currentValue={aiAgent.voice_engine_name}
                  onSelect={(value) => {
                    // update voice_id
                    if (value != aiAgent.voice_engine_name) {
                      // sarvam -> elevenlabs
                      let voice = {
                        voice_id: "",
                        voice_name: "",
                      };
                      if (value == "elevenlabs") {
                        voice.voice_name = "Devi";
                        voice.voice_id = "MF4J4IDTRo0AxOO4dpFR";
                      } else if (value == "sarvam") {
                        voice.voice_name = "Meera";
                        voice.voice_id = "meera";
                      } else if (value == "smallest") {
                        voice.voice_name = "Raman";
                        voice.voice_id = "raman";
                      }
                      setFormData((old) => {
                        return { ...old, ...voice, voice_engine_name: value };
                      });
                    }
                    console.log("value", value);
                    handleDropdownChange("voice_engine_name", value);
                    setIsChanged(true);
                  }}
                />

                {/* stt options dropdown */}
                <Dropdown
                  items={STTOptions}
                  style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
                  currentValue={formData.STT_name}
                  onSelect={(value) => handleDropdownChange("STT_name", value)}
                />
                {/* Model Options Dropdown */}
                <Dropdown
                  items={modelOptions}
                  style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
                  currentValue={formData.chatgpt_model}
                  onSelect={(value) => {
                    updateAiAgent(selectedAgentId, {
                      chatgpt_model: value,
                    }).then((res) => {
                      if (res.data) {
                        toast.success("Model updated successfully");
                        setFormData({ ...formData, chatgpt_model: value });
                      } else {
                        toast.error("Failed to update model");
                      }
                    });
                  }}
                />

                {/* Who Speaks First Options Dropdown */}
                <Dropdown
                  items={whoSpeaksFirstOptions}
                  style={{ backgroundColor: "rgba(85, 87, 104, 0.2)" }}
                  currentValue={formData.who_speaks_first}
                  onSelect={(value) =>
                    handleDropdownChange("who_speaks_first", value)
                  }
                />

                {/* Test Audio Button */}
                <button
                  className="fill-btn test-btn"
                  onClick={() => handleMakeWebCall(aiAgent._id)}
                  disabled={!isVoiceAiActive}
                >
                  Test Audio
                </button>
              </div>

              {/* Settings Section */}
              {selectedAgentId ? (
                <section className="settings-section">
                  <div className="settings-content">
                    <AgentSettings
                      agent={aiAgent}
                      formData={{ ...advancedSettings, ...formData }}
                      handleInputChange={handleInputChange}
                      handleDropdownChange={handleDropdownChange}
                      handleSubmit={handleSubmit}
                      isChanged={isChanged}
                      toggleToolPopup={toggleToolPopup}
                      showToolPopup={showToolPopup}
                      addCalendarTool={addCalendarTool}
                      calendarTools={calendarTools}
                      handleDeleteCalendarTool={handleDeleteCalendarTool}
                      handleCalendarToolChange={handleCalendarToolChange}
                      updateAgent={handleUpdateAgent}
                    />
                  </div>
                  {inCall && (
                    <CallScreen
                      agentId={aiAgent._id}
                      onClose={() => handleStopWebCall()}
                    />
                  )}
                </section>
              ) : (
                <div className="fade grid-center text-center">
                  <div>
                    <Image
                      src={aiAgentImg.src}
                      width={400}
                      height={400}
                      alt="Add agent"
                    />
                    <h3 className="fade-text">
                      Add an Agent to Start Your Journey
                    </h3>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
}

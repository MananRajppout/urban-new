import React from "react";
import AgentPromptInput from "./AgentPromptInput";
import BackgroundSoundSelector from "./BackgroundSoundSelector";
import VoiceSettings from "./VoiceSettings";
import { Button } from "@/components/ui/button";
import UpdateAgentWelcomeMessage from "./UpdateAgentWelcomeMessage";
import UpdateHangUpPrompt from "./UpdateHangUpPrompt";
import SilenceSetting from "./SilenceSettings";

const PromptAndSettingsSection = ({
  prompt,
  setPrompt,
  backgroundSound,
  setBackgroundSound,
  backgroundVolume,
  handleVolumeChange,
  voiceSpeed,
  handleVoiceSpeedChange,
  temperature,
  handleTemperatureChange,
  agentId,
  mutate,
  handleSavePrompt,
  handleRevertPrompt,
  welcome_message_text,
  handleWelcomeMessageChange,
  hangUpPromt,
  handlehangUpPromtChange,
  silence_1_timeout,
  set_silence_1_timeout,
  silence_2_timeout,
  set_silence_2_timeout,
  silence_1_speech,
  set_silence_1_speech,
  silence_2_speech,
  set_silence_2_speech,
  tts_engine,
  voice_loudness,
  handleVoiceLoudnessChange,
  voice_pitch,
  handleVoicePitchChange,
  voice_consistency,
  handleVoiceConsistencyChange,
  voice_similarity,
  handleVoiceSimilarityChange,
  voice_enhancement,
  handleVoiceEnhancementChange,
  voice_stability,
  handleVoiceStabilityChange,
  voice_style,
  handleVoiceStyleChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Left Panel - Base Prompt (70% width) */}
        <div className="glass-panel p-6 md:col-span-7">
          <h2 className="text-lg font-medium text-white mb-4">Configration</h2>

          <UpdateAgentWelcomeMessage
            welcome_message_text={welcome_message_text}
            handleWelcomeMessageChange={handleWelcomeMessageChange}
          />
          <AgentPromptInput
            prompt={prompt.new}
            setPrompt={setPrompt}
            agentId={agentId}
            mutate={mutate}
          />

          <UpdateHangUpPrompt
            hang_up_promt={hangUpPromt}
            handleHangUpPromptChange={handlehangUpPromtChange}
          />
          {(prompt.new !== prompt.old || welcome_message_text.new !== welcome_message_text.old || hangUpPromt.new !== hangUpPromt.old) && (
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={handleSavePrompt}
                className="px-4 py-2 bg-accent-teal text-black font-medium hover:bg-accent-teal/90"
              >
                Save
              </Button>
              <Button
                onClick={handleRevertPrompt}
                className="px-4 py-2 bg-gray-300 text-black font-medium hover:bg-gray-400"
              >
                Revert
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Voice Settings and Background Sound (30% width) */}
        <div className="space-y-6 md:col-span-3">
          {/* Background Sound */}
          {/* <BackgroundSoundSelector
            backgroundSound={backgroundSound}
            setBackgroundSound={setBackgroundSound}
            backgroundVolume={backgroundVolume}
            handleVolumeChange={handleVolumeChange}
            agentId={agentId}
            mutate={mutate}
          /> */}

          {/* Voice Settings */}
          <VoiceSettings
            voiceSpeed={voiceSpeed}
            handleVoiceSpeedChange={handleVoiceSpeedChange}
            temperature={temperature}
            handleTemperatureChange={handleTemperatureChange}
            agentId={agentId}
            mutate={mutate}
            tts_engine={tts_engine}
            voice_loudness={voice_loudness}
            handleVoiceLoudnessChange={handleVoiceLoudnessChange}
            voice_pitch={voice_pitch}
            handleVoicePitchChange={handleVoicePitchChange}
            voice_consistency={voice_consistency}
            handleVoiceConsistencyChange={handleVoiceConsistencyChange}
            voice_similarity={voice_similarity}
            handleVoiceSimilarityChange={handleVoiceSimilarityChange}
            voice_enhancement={voice_enhancement}
            handleVoiceEnhancementChange={handleVoiceEnhancementChange}
            voice_stability={voice_stability}
            handleVoiceStabilityChange={handleVoiceStabilityChange}
            voice_style={voice_style}
            handleVoiceStyleChange={handleVoiceStyleChange}
          />



        </div>
      </div>


      <SilenceSetting
        {
        ...{
          silence_1_timeout,
          set_silence_1_timeout,
          silence_2_timeout,
          set_silence_2_timeout,
          silence_1_speech,
          set_silence_1_speech,
          silence_2_speech,
          set_silence_2_speech,
        }
        }
      />
    </>
  );
};

export default PromptAndSettingsSection;
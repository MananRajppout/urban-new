import React from "react";
import VoiceSpeedControl from "./VoiceSpeedControl";
import TemperatureControl from "./TemperatureControl";
import VolumeControl from "./VolumeControl";

const VoiceSettings = ({
  voiceSpeed,
  handleVoiceSpeedChange,
  temperature,
  handleTemperatureChange,
  volume,
  handleVolumeChange,
}) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-medium text-white mb-4">Voice Settings</h2>

      <div className="space-y-6">
        <VoiceSpeedControl
          voiceSpeed={voiceSpeed}
          handleVoiceSpeedChange={handleVoiceSpeedChange}
        />
        <TemperatureControl
          temperature={temperature}
          handleTemperatureChange={handleTemperatureChange}
        />
        <VolumeControl
          volume={volume}
          handleVolumeChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default VoiceSettings;

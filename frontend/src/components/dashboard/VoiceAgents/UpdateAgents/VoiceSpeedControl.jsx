import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceSpeedControl = ({ voiceSpeed, handleVoiceSpeedChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Speed</label>
        <span className="text-sm text-white">{voiceSpeed.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[1.0]}
        max={2.0}
        min={0.5}
        step={0.1}
        value={[voiceSpeed]}
        onValueChange={handleVoiceSpeedChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceSpeedControl;

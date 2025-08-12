import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceStability = ({ voiceStability, handleVoiceStabilityChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Stability</label>
        <span className="text-sm text-white">{voiceStability.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[0.5]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[voiceStability]}
        onValueChange={handleVoiceStabilityChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceStability;

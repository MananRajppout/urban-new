import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceConsistency = ({ voiceConsistency, handleVoiceConsistencyChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Consistency</label>
        <span className="text-sm text-white">{voiceConsistency.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[0.5]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[voiceConsistency]}
        onValueChange={handleVoiceConsistencyChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceConsistency;

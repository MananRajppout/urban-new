import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceEnhancement = ({ voiceEnhancement, handleVoiceEnhancementChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Enhancement</label>
        <span className="text-sm text-white">{voiceEnhancement.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[1.0]}
        max={2.0}
        min={0.0}
        step={0.1}
        value={[voiceEnhancement]}
        onValueChange={handleVoiceEnhancementChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceEnhancement;

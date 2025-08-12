import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceStyle = ({ voiceStyle, handleVoiceStyleChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Style</label>
        <span className="text-sm text-white">{(voiceStyle).toFixed(1)}%</span>
      </div>
      <Slider
        defaultValue={[0.0]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[voiceStyle]}
        onValueChange={handleVoiceStyleChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceStyle;

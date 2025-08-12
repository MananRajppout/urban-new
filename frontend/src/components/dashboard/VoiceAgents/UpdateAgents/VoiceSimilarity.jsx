import React from "react";
import { Slider } from "@/components/ui/slider";

const VoiceSimilarity = ({ voiceSimilarity, handleVoiceSimilarityChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Voice Similarity</label>
        <span className="text-sm text-white">{voiceSimilarity.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[0.0]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[voiceSimilarity]}
        onValueChange={handleVoiceSimilarityChange}
        className="pb-4"
      />
    </div>
  );
};

export default VoiceSimilarity;

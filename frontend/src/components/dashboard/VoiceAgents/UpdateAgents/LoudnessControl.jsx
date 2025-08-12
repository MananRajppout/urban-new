import React from "react";
import { Slider } from "@/components/ui/slider";

const LoudnessControl = ({ loudness, handleLoudnessChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Loudness</label>
        <span className="text-sm text-white">{loudness?.toFixed(1) || 1}</span>
      </div>
      <Slider
        defaultValue={[0.7]}
        max={2.0}
        min={0.5}
        step={0.1}
        value={[loudness || 1]}
        onValueChange={handleLoudnessChange}
        className="pb-4"
      />
    </div>
  );
};

export default LoudnessControl;

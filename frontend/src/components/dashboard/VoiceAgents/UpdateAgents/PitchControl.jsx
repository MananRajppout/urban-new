import React from "react";
import { Slider } from "@/components/ui/slider";

const PitchControl = ({ pitch, handlePitchChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Pitch</label>
        <span className="text-sm text-white">{(pitch).toFixed(1)}</span>
      </div>
      <Slider
        defaultValue={[0.0]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[pitch]}
        onValueChange={handlePitchChange}
        className="pb-4"
      />
    </div>
  );
};

export default PitchControl;

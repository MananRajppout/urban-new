import React from "react";
import { Slider } from "@/components/ui/slider";

const VolumeControl = ({ volume, handleVolumeChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Volume</label>
        <span className="text-sm text-white">{(volume * 100).toFixed(0)}%</span>
      </div>
      <Slider
        defaultValue={[1.0]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[volume]}
        onValueChange={handleVolumeChange}
        className="pb-4"
      />
    </div>
  );
};

export default VolumeControl;

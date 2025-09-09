import React from "react";
import { Slider } from "@/components/ui/slider";

const TempretureControll = ({ temperature, handleTemperatureChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Temperature</label>
        <span className="text-sm text-white">{temperature.toFixed(1)}x</span>
      </div>
      <Slider
        defaultValue={[0.3]}
        max={1}
        min={0}
        step={0.1}
        value={[temperature]}
        onValueChange={handleTemperatureChange}
        className="pb-4"
      />
    </div>
  );
};

export default TempretureControll;

import React from "react";
import { Slider } from "@/components/ui/slider";

const TemperatureControl = ({ temperature, handleTemperatureChange }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-400">Temperature</label>
        <span className="text-sm text-white">{temperature.toFixed(1)}</span>
      </div>
      <Slider
        defaultValue={[0.7]}
        max={1.0}
        min={0.0}
        step={0.1}
        value={[temperature]}
        onValueChange={handleTemperatureChange}
        className="pb-4"
      />
    </div>
  );
};

export default TemperatureControl;

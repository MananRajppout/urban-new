import React from "react";
import { Slider } from "@/components/ui/slider";

const SilenceTimeControll = ({ value, handleChangeValue, heading,desc}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-400">{heading}</label>
                <span className="text-sm text-white">{value}</span>
            </div>
            <Slider
                defaultValue={[8]}
                max={60}
                min={8}
                step={1}
                value={[value]}
                onValueChange={handleChangeValue}
                className="pb-4"
            />
            <p className="text-xs text-gray-400 mt-2">
                {desc}
            </p>
        </div>
    );
};

export default SilenceTimeControll;

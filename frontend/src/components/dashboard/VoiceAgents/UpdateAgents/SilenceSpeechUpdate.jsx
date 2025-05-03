import React from "react";
import { Slider } from "@/components/ui/slider";

const SilenceSpeechUpdate = ({ value, handleChangeValue, heading, desc }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
                {heading}
            </label>
            <input
                value={value}
                onChange={(e) => handleChangeValue([e.target.value])}
                placeholder="Provide You Agent Welcome Message."
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">
                {desc}
            </p>
        </div>
    );
};

export default SilenceSpeechUpdate;

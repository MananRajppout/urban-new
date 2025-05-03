import { useState } from "react";

export default function CostEstimator() {
  // State hooks for managing user inputs and selections
  const [minutes, setMinutes] = useState(100);
  const [selectedLLM, setSelectedLLM] = useState("GPT 3.5 turbo");
  const [selectedVoice, setSelectedVoice] = useState("Elevenlabs Voices");
  const [selectedTelephony, setSelectedTelephony] = useState("Urbanchat Twilio");

  // Base cost per minute
  var baseCostPerMinute = 0;

  // Additional costs associated with each selection
  const additionalCosts = {
    llm: {
      "GPT 3.5 turbo": 0.02,
      "GPT 4 o": 0.10,
      "GPT 4 turbo": 0.20,
    },
    voice: {
      // "OpenAI / Deepgram Voices": 0.01,
      "Elevenlabs Voices": 0.10,
    },
    telephony: {
      "Urbanchat Twilio": 0.01,
    },
  };

  // Arrays for available options
  const llmAgents = ["GPT 3.5 turbo", "GPT 4 o", "GPT 4 turbo"];
  const voiceEngines = [ "Elevenlabs Voices"];
  const telephonyOptions = ["Urbanchat Twilio"];

  // Function to calculate the total cost based on user selections and input
  const calculateTotalCost = () => {
    const llmCost = selectedLLM ? additionalCosts.llm[selectedLLM] : 0;
    const voiceCost = selectedVoice ? additionalCosts.voice[selectedVoice] : 0;
    const telephonyCost = selectedTelephony ? additionalCosts.telephony[selectedTelephony] : 0;

    // Total cost per minute, including base cost and additional costs
    const totalCostPerMinute = llmCost + voiceCost + telephonyCost;
    baseCostPerMinute = totalCostPerMinute;
    return (minutes * totalCostPerMinute).toFixed(2);
  };

  // Calculate total cost
  const totalCost = calculateTotalCost();

  return (
    <div className="mt-10 mb-16">
      <h1 className="text-4xl font-bold mb-10 text-center text-white">Estimate Your Cost</h1>
      <div className="mt-10 mx-auto p-6 rounded-xl shadow-lg flex flex-col md:flex-row border-4 border-sky-500 bg-[#191919] bg-opacity-70 backdrop-filter backdrop-blur-md">
        <div className="flex-1 w-full">
          {/* Input for the number of minutes */}
          <div className="mb-8">
            <label className="block mb-2 text-sm text-white">How many minutes of calls do you have per month?</label>
            <input
              type="range"
              min="100"
              max="100000"
              value={minutes}
              step={100}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full appearance-none h-1 bg-[--color-surface2] focus:transparent"
            />
            <span className="block mt-2 text-xl text-center md:text-left text-white">{minutes} minutes</span>
          </div>

          {/* LLM Agent selection */}
          <div className="mb-8">
            <span className="block text-sm text-white">LLM Agent</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {llmAgents.map((agent) => (
                <button
                  key={agent}
                  className={`px-4 py-2 rounded-full focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                    selectedLLM === agent
                      ? "bg-white text-black border border-gray-300"
                      : "bg-[--color-surface2] text-white border border-transparent"
                  }`}
                  onClick={() => setSelectedLLM(agent)}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine selection */}
          {/* <div className="mb-8">
            <span className="block text-sm text-white">Voice Engine</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {voiceEngines.map((engine) => (
                <button
                  key={engine}
                  className={`px-4 py-2 rounded-full focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                    selectedVoice === engine
                      ? "bg-white text-black border border-gray-300"
                      : "bg-[--color-surface2] text-white border border-transparent"
                  }`}
                  onClick={() => setSelectedVoice(engine)}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div> */}

          {/* Telephony option selection */}
          {/* <div className="mb-8">
            <span className="block text-sm text-white">Telephony</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {telephonyOptions.map((option) => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded-full focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                    selectedTelephony === option
                      ? "bg-white text-black border border-gray-300"
                      : "bg-[--color-surface2] text-white border border-transparent"
                  }`}
                  onClick={() => setSelectedTelephony(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Cost display card */}
        <div className="w-full md:w-1/4 mt-6 md:mt-0 md:ml-8 flex flex-col items-start md:items-center">
          <div className="p-5 w-full flex flex-col justify-between bg-[--color-surface2] rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="text-md text-white">Cost Per Minute</div>
              <div className="text-2xl font-semibold text-white">${baseCostPerMinute.toFixed(3)}</div>
            </div>
            <hr className="w-full border-t-2 border-white" />
            <div className="flex justify-between items-center mt-4">
              <div className="text-md text-white">Total</div>
              <div className="text-2xl font-semibold text-white">${totalCost}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

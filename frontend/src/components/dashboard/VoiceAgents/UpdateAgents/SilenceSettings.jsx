import React from "react";
import VoiceSpeedControl from "./VoiceSpeedControl";
import LoudnessControl from "./LoudnessControl";
import PitchControl from "./PitchControl";
import SilenceTimeControll from "./SilenceTimeControll";
import SilenceSpeechUpdate from "./SilenceSpeechUpdate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const SilenceSetting = ({
  silence_1_timeout,
  set_silence_1_timeout,
  silence_2_timeout,
  set_silence_2_timeout,
  silence_1_speech,
  set_silence_1_speech,
  silence_2_speech,
  set_silence_2_speech,
  levels,
  handleAddLevel,
  handleAddMoreLevel,
  handleDeleteLevel,
  handleSaveLevels
}) => {
  return (
    <>
      <div className="glass-panel p-6">
        <h2 className="text-lg font-medium text-white mb-4">Add Labels</h2>

        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex justify-end items-center">
              <Button onClick={() => handleAddMoreLevel()} className="border-none cursor-pointer text-white">Add Label</Button>
            </div>

            {
              levels.map((level, index) => (
                <div key={index} className="flex items-center gap-4">
                  
                
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <input
                        value={level.name}
                        onChange={(e) => handleAddLevel(index, "name", e.target.value)}
                        placeholder="Level Name"
                        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white hover:border-accent-teal hover:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <input
                        value={level.description}
                        onChange={(e) => handleAddLevel(index, "description", e.target.value)}
                        placeholder="Label Description"
                        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white hover:border-accent-teal hover:outline-none resize-none"
                      />
                    </div>

                  </div>

                  <Button onClick={() => handleDeleteLevel(index)} className="border-none cursor-pointer text-white bg-red-500 rounded-full hover:bg-red-600">X</Button>
                </div>
              ))
            }
            {
              levels.length > 0 && (
                <div className="flex justify-end items-center">
                  <Button onClick={() => handleSaveLevels()} className="border-none cursor-pointer text-white">Save Levels</Button>
                </div>
              )
            }
            
          </div>
        </div>
      </div>
      <div className="glass-panel p-6">
        <h2 className="text-lg font-medium text-white mb-4">Interaction Settings</h2>

        <div className="space-y-6">
          <div className="space-y-6">
            <SilenceTimeControll
              value={silence_1_timeout}
              handleChangeValue={set_silence_1_timeout}
              heading={"Silence Detection Timeout"}
              desc={"If the user stays silent for this many seconds, the assistant will gently check in (e.g., 'Are you there?"}
            />
            <SilenceSpeechUpdate
              value={silence_1_speech}
              handleChangeValue={set_silence_1_speech}
              heading={"First Silence Speech"}
              desc={"What the assistant should say after the user is silent for the first timeout period."}
            />
            <SilenceTimeControll
              value={silence_2_timeout}
              handleChangeValue={set_silence_2_timeout}
              heading={"Maximum User Response Time"}
              desc={"The maximum amount of time the assistant will wait for a user reply before taking the next action or ending the conversation."}
            />
            <SilenceSpeechUpdate
              value={silence_2_speech}
              handleChangeValue={set_silence_2_speech}
              heading={"Final Speech Before Exit"}
              desc={"Since I haven't heard from you, I'll go ahead and end the call."}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SilenceSetting;

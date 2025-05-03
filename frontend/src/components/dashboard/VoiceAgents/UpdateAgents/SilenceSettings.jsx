import React from "react";
import VoiceSpeedControl from "./VoiceSpeedControl";
import TemperatureControl from "./TemperatureControl";
import VolumeControl from "./VolumeControl";
import SilenceTimeControll from "./SilenceTimeControll";
import SilenceSpeechUpdate from "./SilenceSpeechUpdate";

const SilenceSetting = ({
  silence_1_timeout,
  set_silence_1_timeout,
  silence_2_timeout,
  set_silence_2_timeout,
  silence_1_speech,
  set_silence_1_speech,
  silence_2_speech,
  set_silence_2_speech,
}) => {
  return (
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
  );
};

export default SilenceSetting;

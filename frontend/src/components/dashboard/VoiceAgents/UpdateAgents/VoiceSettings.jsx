import React from "react";
import VoiceSpeedControl from "./VoiceSpeedControl";
import LoudnessControl from "./LoudnessControl";
import PitchControl from "./PitchControl";
import VoiceConsistency from "./VoiceConsistency";
import VoiceSimilarity from "./VoiceSimilarity";
import VoiceEnhancement from "./VoiceEnhancement";
import VoiceStability from "./VoiceStability";
import VoiceStyle from "./VoiceStyle";

const VoiceSettings = ({
  voiceSpeed,
  handleVoiceSpeedChange,
  loudness,
  handleLoudnessChange,
  pitch,
  handlePitchChange,
  tts_engine,
  voice_loudness,
  handleVoiceLoudnessChange,
  voice_pitch,
  handleVoicePitchChange,
  voice_consistency,
  handleVoiceConsistencyChange,
  voice_similarity,
  handleVoiceSimilarityChange,
  voice_enhancement,
  handleVoiceEnhancementChange,
  voice_stability,
  handleVoiceStabilityChange,
  voice_style,
  handleVoiceStyleChange,
}) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-medium text-white mb-4">
        Voice Settings
      </h2>


      <div className="space-y-6">
        {
          tts_engine == "deepgram" && (
            <h2 className="text-white text-lg">No settings available for deepgram</h2>
          )
        }
        {
          (tts_engine == "smallest" || tts_engine == "smallest-v2") && (
            <>
              <VoiceSpeedControl
                voiceSpeed={voiceSpeed}
                handleVoiceSpeedChange={handleVoiceSpeedChange}
              />
              <VoiceConsistency
                voiceConsistency={voice_consistency}
                handleVoiceConsistencyChange={handleVoiceConsistencyChange}
              />
              <VoiceSimilarity
                voiceSimilarity={voice_similarity}
                handleVoiceSimilarityChange={handleVoiceSimilarityChange}
              />
              <VoiceEnhancement
                voiceEnhancement={voice_enhancement}
                handleVoiceEnhancementChange={handleVoiceEnhancementChange}
              />
            </>
          )
        }
        {
          tts_engine == "elevenlabs" && (
            <>
              <VoiceSpeedControl
                voiceSpeed={voiceSpeed}
                handleVoiceSpeedChange={handleVoiceSpeedChange}
              />

              <VoiceStability
                voiceStability={voice_stability}
                handleVoiceStabilityChange={handleVoiceStabilityChange}
              />

              <VoiceStyle
                voiceStyle={voice_style}
                handleVoiceStyleChange={handleVoiceStyleChange}
              />
            </>
          )
        }

        {
          tts_engine == "sarvam" && (
            <>
              <VoiceSpeedControl
                voiceSpeed={voiceSpeed}
                handleVoiceSpeedChange={handleVoiceSpeedChange}
              />

              <LoudnessControl
                loudness={voice_loudness}
                handleLoudnessChange={handleVoiceLoudnessChange}
              />
              <PitchControl
                pitch={voice_pitch}
                handlePitchChange={handleVoicePitchChange}
              />
            </>
          )
        }

        {
          tts_engine == "rime" && (
            <>
              <VoiceSpeedControl
                voiceSpeed={voiceSpeed}
                handleVoiceSpeedChange={handleVoiceSpeedChange}
              />
            </>
          )
        }


      </div>
    </div>
  );
};

export default VoiceSettings;

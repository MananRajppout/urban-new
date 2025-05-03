import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useBackgroundSounds } from "@/hooks/useVoice";
import { updateAiAgent } from "@/lib/api/ApiAiAssistant";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const BackgroundSoundSelector = ({
  backgroundSound,
  setBackgroundSound,
  backgroundVolume,
  handleVolumeChange,
  agentId,
}) => {
  const { data: backgroundSounds, isLoading } = useBackgroundSounds();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBackgroundSoundChange = async (e) => {
    const newValue = e.target.value;
    setBackgroundSound(newValue);

    // if (!agentId) return;

    // try {
    //   setIsUpdating(true);
    //   const payload = {
    //     ambient_sound: newValue,
    //   };

    //   const response = await updateAiAgent(agentId, payload);

    //   if (response.data && response.data.success) {
    //     toast.success("Background sound updated successfully");
    //   } else {
    //     toast.error(
    //       response.data?.message || "Failed to update background sound"
    //     );
    //   }
    // } catch (error) {
    //   console.error("Error updating background sound:", error);
    //   toast.error("Failed to update background sound");
    // } finally {
    //   setIsUpdating(false);
    // }
  };

  const handleBackgroundVolumeChange = async (value) => {
    const newVolume = value[0];
    handleVolumeChange(value);

    // if (!agentId) return;

    // try {
    //   setIsUpdating(true);
    //   const payload = {
    //     ambient_sound_volume: newVolume,
    //   };

    //   const response = await updateAiAgent(agentId, payload);

    //   if (response.data && response.data.success) {
    //     toast.success("Background volume updated successfully");
    //   } else {
    //     toast.error(
    //       response.data?.message || "Failed to update background volume"
    //     );
    //   }
    // } catch (error) {
    //   console.error("Error updating background volume:", error);
    //   toast.error("Failed to update background volume");
    // } finally {
    //   setIsUpdating(false);
    // }
  };

  return (
    <div className="glass-panel p-6 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md z-10">
          <Loader2 className="w-6 h-6 animate-spin text-accent-teal" />
        </div>
      )}

      <h2 className="text-lg font-medium text-white mb-4">Background Sound</h2>
      <select
        value={backgroundSound}
        onChange={handleBackgroundSoundChange}
        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white focus:border-accent-teal focus:outline-none mb-4"
        disabled={isLoading || isUpdating}
      >
        <option value="none">None</option>
        {backgroundSounds?.map((sound) => (
          <option key={sound.id} value={sound.id}>
            {sound.name}
          </option>
        ))}
      </select>

      {backgroundSound !== "none" && (
        <>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-400">
              Background Volume
            </label>
            <span className="text-sm text-white">
              {(backgroundVolume * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            defaultValue={[0.3]}
            max={1.0}
            min={0.0}
            step={0.1}
            value={[backgroundVolume]}
            onValueChange={handleBackgroundVolumeChange}
            disabled={isUpdating}
          />
        </>
      )}
    </div>
  );
};

export default BackgroundSoundSelector;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, X, Play, Pause, Check } from "lucide-react";
import useSWR from "swr";
import { fetchAllVoices, updateAiAgent } from "@/lib/api/ApiAiAssistant";
import { toast } from "react-hot-toast";

const VoiceSelector = ({
  ttsModel,
  voice,
  voiceId,
  setVoice,
  agentId,
  mutate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [selectedVoice, setSelectedVoice] = useState({
    voice_name: voice,
    voice_id: voiceId,
  });

  useEffect(() => {
    setSelectedVoice({
      voice_name: voice,
      voice_id: voiceId,
    });
  }, [voice, voiceId]);

  const {
    data: voicesData,
    error,
    isLoading,
  } = useSWR("voices", fetchAllVoices);

  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, [audioElements]);

  const handleToggleModal = () => {
    setIsOpen(!isOpen);
    if (isOpen && currentPlayingId) {
      stopAudio(currentPlayingId);
    }
  };

  const playAudio = (voiceId, voiceUrl) => {
    if (!voiceUrl) return;

    if (currentPlayingId && currentPlayingId !== voiceId) {
      stopAudio(currentPlayingId);
    }

    let audio = audioElements[voiceId];
    if (!audio) {
      audio = new Audio(voiceUrl);
      setAudioElements((prev) => ({ ...prev, [voiceId]: audio }));
    }

    audio
      .play()
      .then(() => {
        setCurrentPlayingId(voiceId);

        audio.onended = () => {
          setCurrentPlayingId(null);
        };
      })
      .catch((err) => {
        console.error("Error playing audio:", err);
        setCurrentPlayingId(null);
      });
  };

  const stopAudio = (voiceId) => {
    const audio = audioElements[voiceId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setCurrentPlayingId(null);
    }
  };

  const handleSelectVoice = (voice) => {
    if (agentId) {
      const voiceData = {
        voice_id: voice.voice_id,
        voice_engine_name: ttsModel,
        voice_name: voice.name,
      };

      updateAiAgent(agentId, voiceData)
        .then((response) => {
          if (response.data) {
            toast.success("Voice updated successfully");
            setSelectedVoice({
              voice_name: voice.name,
              voice_id: voice.voice_id,
            });

            setVoice({
              voice_name: voice.name,
              voice_id: voice.voice_id,
            });

            if (mutate) {
              mutate();
            }
          } else {
            toast.error("Failed to update voice");
          }
        })
        .catch((error) => {
          console.error("Error updating voice:", error);
          toast.error("Failed to update voice");
        });
    } else {
      setSelectedVoice({
        voice_name: voice.name,
        voice_id: voice.voice_id,
      });

      setVoice({
        voice_name: voice.name,
        voice_id: voice.voice_id,
      });
    }

    setIsOpen(false);
    if (currentPlayingId) {
      stopAudio(currentPlayingId);
    }
  };

  const getFilteredVoices = () => {
    if (!voicesData || !voicesData.data) return [];

    switch (ttsModel) {
      case "elevenlabs":
        return voicesData?.data?.elevenlabs || [];
      case "sarvam":
        return voicesData?.data?.sarvam || [];
      case "smallest":
        return voicesData?.data?.smallest || [];
      case "deepgram":
        return voicesData?.data?.deepgram || [];
      case "rime":
        return voicesData?.data?.rime || [];
      case "kokoro":
        return voicesData?.data?.kokoro || [];
      default:
        return [];
    }
  };

  const filteredVoices = getFilteredVoices();

  return (
    <div className="relative z-50 ">
      <Button
        type="button"
        onClick={handleToggleModal}
        variant="outline"
        className="w-full justify-between border-0"
      >
        {selectedVoice.voice_name || "Select a voice"}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed   top-0 left-0 bottom-40 right-0  flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-0 border-b">
              <h2 className="text-xl font-semibold">Select a Voice</h2>
              <Button
                variant="ghost"
                className="border-0 bg-transparent cursor-pointer"
                size="icon"
                onClick={handleToggleModal}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="overflow-auto flex-1 p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-teal"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-4">
                  Error loading voices. Please try again.
                </div>
              ) : filteredVoices.length === 0 ? (
                <div className="text-center p-4">
                  No voices available for the selected TTS model: {ttsModel}
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(55vh-4rem)]">
                  <table className="w-full border-collapse ">
                    <thead className="sticky top-0 bg-background z-[2002]">
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left whitespace-nowrap text-xs w-[10%]">
                          Demo Audio
                        </th>
                        <th className="p-2 text-left whitespace-nowrap text-xs w-[15%]">
                          Name
                        </th>
                        <th className="p-2 text-left whitespace-nowrap text-xs w-[25%]">
                          Voice ID
                        </th>
                        <th className="p-2 text-left whitespace-nowrap text-xs w-[15%]">
                          Accent
                        </th>
                        <th className="p-2 text-left whitespace-nowrap text-xs w-[15%]">
                          Gender
                        </th>
                        <th className="p-2 text-left text-xs w-[15%]">Age</th>
                        <th className="p-2 text-left w-[5%]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVoices.map((voice) => (
                        <tr
                          key={voice.voice_id}
                          className={`border-b border-muted hover:bg-muted/30 transition-colors ${
                            selectedVoice.voice_id === voice.voice_id
                              ? "bg-muted/50"
                              : ""
                          }`}
                        >
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              className="bg-transparent border-0 cursor-pointer h-8 w-8 p-0"
                              size="icon"
                              onClick={() =>
                                currentPlayingId === voice.voice_id
                                  ? stopAudio(voice.voice_id)
                                  : playAudio(voice.voice_id, voice.voice_url)
                              }
                              disabled={!voice.voice_url}
                            >
                              {currentPlayingId === voice.voice_id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play
                                  className={`h-4 w-4 ${
                                    !voice.voice_url ? "opacity-50" : ""
                                  }`}
                                />
                              )}
                            </Button>
                          </td>
                          <td className="p-2 text-xs ">{voice.name}</td>
                          <td className="p-2 font-mono text-xs ">
                            {voice.voice_id}
                          </td>
                          <td className="p-2 text-xs capitalize ">
                            {voice.accent || "N/A"}
                          </td>
                          <td className="p-2 text-xs capitalize ">
                            {voice.gender || "N/A"}
                          </td>
                          <td className="p-2 text-xs capitalize ">
                            {voice.age
                              ? voice.age.replace
                                ? voice.age.replace("_", " ")
                                : voice.age
                              : "N/A"}
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleSelectVoice({
                                  name: voice.name,
                                  voice_id: voice.voice_id,
                                })
                              }
                              className="bg-transparent border-0 p-1 cursor-pointer"
                            >
                              {selectedVoice.voice_id === voice.voice_id ? (
                                <Check className="h-4 w-4 text-accent-teal" />
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-0 p-1 cursor-pointer"
                                >
                                  Select
                                </Button>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;

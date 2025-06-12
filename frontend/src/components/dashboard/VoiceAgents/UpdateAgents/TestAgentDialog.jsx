import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VoiceCaller from "@/Utils/webCall";
import { hangUpWebCall } from "@/Utils/webCallHandler";
import useConnect from "@/hooks/use-connect";
import {
  LiveKitRoom,
  useTracks,
  useLocalParticipant,
  VideoConference,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import Playground from "./Playground";

const TestAgentDialog = ({ open, onOpenChange, agentName, agentId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const voiceCallRef = useRef(null);
  const {token,identity,wsUrl,loading} = useConnect(agentId);

  useEffect(() => {
    let interval;

    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);



  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const cleanupCall = async () => {};

  const handleHangUpCall = async () => {
    try {
      setIsHangingUp(true);
      setIsConnected(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error hanging up call:", error);
      onOpenChange(false);
    }
  };

  const handleCloseDialog = () => {
    handleHangUpCall();
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="glass-panel border-subtle-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Testing AI Agent
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <Phone className="w-10 h-10 text-accent-teal bg-transparent" />

          <div className="text-center">
            <p className="text-lg font-medium text-white">
              {agentName || "AI Agent"}
            </p>
            {
              token ? (
                <LiveKitRoom serverUrl={wsUrl} token={token} connect>
                  <Playground setIsConnected={setIsConnected} isConnected={isConnected} handleHangUpCall={handleHangUpCall}/>
                  <RoomAudioRenderer/>
                  <StartAudio label="Click to enable audio playback" />
                </LiveKitRoom>
              ):
              (
                <p className="text-accent-teal mt-1">
                  {isHangingUp
                    ? "Disconnecting..."
                    : isConnected
                    ? "Connected"
                    : "Connecting..."}
                </p>
              )
            }
            
            <p className="text-gray-400 mt-1">{formatDuration(callDuration)}</p>

          </div>

          <Button
            className="bg-sentiment-negative border border-none cursor-pointer hover:bg-sentiment-negative/90 text-white px-8"
            onClick={handleHangUpCall}
            disabled={isHangingUp}
          >
            {isHangingUp ? "Hanging Up..." : "Hang Up"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestAgentDialog;

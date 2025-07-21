import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, X, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { makeOutboundCall2 } from "@/lib/api/ApiAiAssistant"; // Mock API function
import VoiceCaller from "@/Utils/webCall";
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
import Playground from "./dashboard/VoiceAgents/UpdateAgents/Playground";
import { useApp } from "@/context/AppContext";


const WebDemoCall = ({ isWebCallActive, setIsWebCallActive }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const voiceCallRef = useRef(null);
  const {websiteSettings} = useApp();
  const { token, identity, wsUrl, loading } = useConnect(websiteSettings?.live_demo_agent || process.env.NEXT_PUBLIC_DEMO_AGENT_ID);

  useEffect(() => {
    let interval;

    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1500);
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


  const handleHangUpCall = async () => {
    try {
      setIsHangingUp(true);
      setIsConnected(false);
      setIsWebCallActive(false);
    } catch (error) {
      console.error("Error hanging up call:", error);
      setIsWebCallActive(false);
    }
  };

  const handleCloseDialog = () => {
    handleHangUpCall();
  };

  return (
    <div className="text-center py-8">
      <div className="glass-panel border border-brand-green/20 rounded-xl p-8 mb-8 relative bg-black/40">
        <div className="aspect-video rounded-md bg-gray-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,209,110,0.1),transparent_70%)]"></div>
          <div className="animate-pulse z-10">
            <Video className="h-20 w-20 text-brand-green/80" />
          </div>
          <div className="absolute bottom-4 right-4 glass-panel p-2 rounded-full bg-black/60">
            <div className="h-3 w-3 rounded-full bg-brand-green animate-pulse"></div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-1">
            Connected to Our AI Agent
          </h3>
          {
            token ? (
              <LiveKitRoom serverUrl={wsUrl} token={token} connect>
                <Playground setIsConnected={setIsConnected} isConnected={isConnected} handleHangUpCall={handleHangUpCall} />
                <RoomAudioRenderer />
                <StartAudio label="Click to enable audio playback" />
              </LiveKitRoom>
            ) :
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
      </div>

      <Button
        onClick={handleHangUpCall}
        variant="destructive"
        className="w-full sm:w-auto px-8 py-6 rounded-full"
        size="lg"
      >
        <X className="mr-2 h-5 w-5" /> End Call
      </Button>
    </div>
  )
}

const LiveDemoSection = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callRequested, setCallRequested] = useState(false);
  const [isWebCallActive, setIsWebCallActive] = useState(false);
  const { toast } = useToast();
  const voiceCallRef = useRef(null);
  const timerRef = useRef(null); // Ref to store the timer interval
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const { websiteSettings } = useApp();

  useEffect(() => {
    if (isCallStarted) {
      // Start the timer when the web call is active
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear the timer when the web call ends
      clearInterval(timerRef.current);
      setCallDuration(0); // Reset the timer
    }

    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [isCallStarted]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    // In a real implementation, this would trigger an API call to initiate the phone call
    console.log("calling to ", phoneNumber);
    try {
      setCallRequested(true);
      const res = await makeOutboundCall2(
        websiteSettings?.live_demo_phone_number,
        phoneNumber
      );
      if (res.data) {
        toast({
          title: "Call Request Sent",
          description: "We are calling you now...",
        });
      } else {
        toast({
          title: "Error",
          description:
            res?.message || "Failed to initiate the call. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate the call. Please try again.",
        variant: "destructive",
      });
      console.error("Error making outbound call:", error);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPhoneNumber("");
      setCallRequested(false);
    }
  };

  const startWebCall = () => {
    setIsWebCallActive(true);
  };

  return (
    <section id="live-demo" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-background" />
      <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/10 blur-[100px] animate-pulse-slow" />
      <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/5 blur-[120px] animate-pulse-slow animation-delay-1000" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Live Demo</span>
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            See how our AI receptionist transforms hotel guest interactions in
            real-time.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-[0_10px_50px_-12px_rgba(29,209,110,0.15)]">
            {isWebCallActive ? (
              <WebDemoCall isWebCallActive={isWebCallActive} setIsWebCallActive={setIsWebCallActive} />
            ) : callRequested ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-brand-green/20 mx-auto flex items-center justify-center mb-6">
                  <div className="animate-pulse">
                    <PhoneCall className="h-12 w-12 text-brand-green" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Call initiated!</h3>
                <p className="text-foreground/70 max-w-md mx-auto">
                  Our AI receptionist is calling you now. Please answer your
                  phone to experience the conversation.
                </p>
              </div>
            ) : (
              <div className="max-w-xl mx-auto">
                <h3 className="text-2xl font-semibold mb-4">
                  Connect with our AI Receptionist
                </h3>
                <p className="text-foreground/70 mb-6">
                  Experience how our AI handles reservations, inquiries, and
                  special requests with natural conversation.
                </p>

                <div className="space-y-6">
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium mb-2 text-foreground/80"
                      >
                        Your Phone Number
                      </label>
                      <Input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 py-6 px-4 rounded-lg focus:border-brand-green focus:ring-brand-green/20"
                        placeholder={`+${websiteSettings?.live_demo_phone_number}`}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full border-0 cursor-pointer bg-brand-green hover:bg-brand-green/90 text-black font-semibold py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/20"
                    >
                      <Phone className="mr-2 h-5 w-5" /> Get a Call Now
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-foreground/60">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={startWebCall}
                    className="w-full border-0 cursor-pointer bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border-brand-green/30 font-semibold py-6 rounded-lg transition-all duration-300"
                  >
                    <Video className="mr-2 h-5 w-5" /> Start Web Demo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;

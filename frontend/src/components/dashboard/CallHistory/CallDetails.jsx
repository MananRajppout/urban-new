import React, { useState } from "react";
import { Download, Play, Pause, Phone, Globe } from "lucide-react";
import { Button } from "../AiChatBot/components/button/Button";

const CallDetails = ({ call }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ", " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getSentimentBadge = (sentiment) => {
    const lowerSentiment = sentiment?.toLowerCase() || "";
    switch (lowerSentiment) {
      case "positive":
        return "bg-sentiment-positive/20 text-sentiment-positive";
      case "neutral":
        return "bg-sentiment-neutral/20 text-sentiment-neutral";
      case "negative":
        return "bg-sentiment-negative/20 text-sentiment-negative";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handlePlayPause = () => {
    if (call.recording_url) {
      setIsPlaying(!isPlaying);
    } else {
      alert("No recording available for this call.");
    }
  };

  const handleDownload = () => {
    if (call.recording_url) {
      window.open(call.recording_url, "_blank");
    } else {
      alert("No recording available to download.");
    }
  };

  // Calculate duration from start and end time
  const calculateDuration = () => {
    if (!call.start_time || !call.end_time) return "N/A";

    const start = new Date(call.start_time);
    const end = new Date(call.end_time);
    const durationMs = end - start;

    if (isNaN(durationMs) || durationMs < 0) return "N/A";

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Determine call type icon
  const getCallTypeIcon = () => {
    if (call.calltype === "web") {
      return <Globe className="w-5 h-5 text-accent-teal" />;
    } else {
      return <Phone className="w-5 h-5 text-accent-teal" />;
    }
  };

  // Format chat history for transcript
  const formatChatHistory = () => {
    if (!call.chat_history || call.chat_history.length === 0) {
      return [];
    }

    return call.chat_history.map((entry, index) => {
      // Extract time from timestamp
      const time = entry.timestamp ? new Date(entry.timestamp) : null;
      const timeString = time
        ? `${time.getMinutes()}:${time
            .getSeconds()
            .toString()
            .padStart(2, "0")}`
        : `${index}:00`;

      return {
        time: timeString,
        speaker: entry.role === "agent" ? "Agent" : "Customer",
        text: entry.content,
      };
    });
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header with title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">Call Details</h1>
      </div>

      {/* Call Type & ID Banner */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-accent-teal/20 flex items-center justify-center">
            {getCallTypeIcon()}
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              {call.calltype === "web" ? "Web Call" : "Phone Call"}
            </h2>
            <p className="text-sm text-gray-400">ID: {call._id}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm ${getSentimentBadge(
            call.user_sentiment
          )}`}
        >
          {call.user_sentiment || "Unknown"}
        </span>
      </div>

      {/* Audio Player */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-medium text-white mb-4">Call Recording</h3>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-subtle-border text-white hover:bg-accent-teal/20"
            onClick={handlePlayPause}
            disabled={!call.recording_url}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            variant="outline"
            className="border-subtle-border text-white hover:bg-accent-teal/20"
            onClick={handleDownload}
            disabled={!call.recording_url}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        {!call.recording_url && (
          <p className="text-gray-400 text-sm mt-2">
            No recording available for this call.
          </p>
        )}
      </div>

      {/* Call Information */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Call Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Date & Time</p>
            <p className="text-white">{formatDate(call.created_time)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Duration</p>
            <p className="text-white">{calculateDuration()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">From</p>
            <p className="text-white">{call.from_phone_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">To</p>
            <p className="text-white">{call.plivo_phone_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Agent ID</p>
            <p className="text-white">{call.agent_id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Agent Name</p>
            <p className="text-white">{call.voice_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">AI Model</p>
            <p className="text-white">{call.chatgpt_model || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Voice</p>
            <p className="text-white">{call.voice_name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Call Analysis */}
      <div className="glass-panel p-6">
        <h3 className="text-lg font-medium text-white mb-4">Call Analysis</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400 mb-1">Call Status</p>
            <p
              className={
                call.call_status === "Successful"
                  ? "text-accent-teal"
                  : "text-sentiment-negative"
              }
            >
              {call.call_status || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">User Sentiment</p>
            <p className={`${getSentimentBadge(call.user_sentiment)}`}>
              {call.user_sentiment || "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Disconnection Reason</p>
            <p className="text-white">{call.disconnection_reason || "N/A"}</p>
          </div>
          {call.cost !== undefined && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Cost</p>
              <p className="text-white">${call.cost.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Call Summary */}
      {call.summary && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4">Call Summary</h3>
          <p className="text-white text-sm">{call.summary}</p>
        </div>
      )}

      {/* Call Transcript */}
      {call.chat_history && call.chat_history.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Call Transcript
          </h3>
          <div className="space-y-4">
            {formatChatHistory().map((entry, index) => (
              <div key={index} className="flex">
                <div className="w-12 text-xs text-gray-400 pt-1">
                  {entry.time}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    <span
                      className={
                        entry.speaker === "Agent"
                          ? "text-accent-teal"
                          : "text-accent-purple"
                      }
                    >
                      {entry.speaker}
                    </span>
                  </div>
                  <p className="text-white text-sm">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Transcription Text (if available) */}
      {call.transcription_text && (
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Full Transcription
          </h3>
          <p className="text-white text-sm whitespace-pre-line">
            {call.transcription_text}
          </p>
        </div>
      )}
    </div>
  );
};

export default CallDetails;

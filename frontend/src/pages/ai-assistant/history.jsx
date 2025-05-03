import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Trash, Download, Upload } from "lucide-react";
import { CSVLink } from "react-csv";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { GiBackwardTime } from "react-icons/gi";
import {
  fetchCallHistory,
  fetchSingleCallHistory,
} from "@/lib/api/ApiAiAssistant";
import aiAgentImg from "@/assets/add-agent.png";
import Layout from "@/components/layout/Layout";

export default function History() {
  const [callItems, setCallItems] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [callUuid, setCallUuid] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    async function getCallHistory() {
      try {
        const response = await fetchCallHistory();
        if (response.data.success) {
          setCallItems(response.data.recordings);
          console.log(response.data.recordings);
          setActiveCall(response.data.recordings[0]);
        }
      } catch (error) {
        console.error("Error fetching call history:", error);
      }
    }
    getCallHistory();
  }, [callUuid]);

  const csvHeaders = [
    { label: "Time", key: "start_time" },
    { label: "Call Duration", key: "duration" },
    { label: "Type", key: "calltype" },
    { label: "Cost", key: "cost" },
    { label: "Call ID", key: "caller_id" },
    { label: "Disconnection Reason", key: "disconnection_reason" },
    { label: "User Sentiment", key: "user_sentiment" },
    { label: "From", key: "from_phone_number" },
    { label: "To", key: "plivo_phone_number" },
    { label: "Call Successful", key: "call_status" },
  ];

  useEffect(() => {
    async function getSingleCallHistory() {
      if (id) {
        try {
          const response = await fetchSingleCallHistory(id);
          if (response.data.success) {
            setActiveCall(response.data.recording);

            // setCallUuid(response.data.recording.caller_id);
          }
        } catch (error) {
          console.error("Error fetching single call history:", error);
        }
      }
    }

    getSingleCallHistory();
  }, [id, callUuid]);

  const handleCallClick = (callId) => {
    router.push(`history?id=${callId}`);
  };

  const [selectedCall, setSelectedCall] = useState(null);

  const getElapsedTime = (startTime, messageTime) => {
    const start = new Date(startTime);
    const msgTime = new Date(messageTime);
    const elapsedSec = Math.floor((msgTime - start) / 1000); // Difference in seconds

    const minutes = Math.floor(elapsedSec / 60);
    const seconds = elapsedSec % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`; // Format as mm:ss
  };

  function calculateCallDuration(start_time, end_time) {
    const start = new Date(start_time);
    const end = new Date(end_time);
    const durationMs = end - start; // Difference in milliseconds

    // Convert to seconds
    const seconds =
      Math.floor((durationMs / 1000) % 60).length === "1"
        ? `0,${Math.floor((durationMs / 1000) % 60)}`
        : Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);

    return `${minutes}:${seconds} `;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const callsPerPage = 10;

  // Function to filter calls based on the selected date range
  const getFilteredCalls = () => {
    if (!startDate && !endDate) return callItems; // No filtering if no date is selected

    return callItems.filter((call) => {
      const callDate = new Date(call.start_time);
      return (
        (!startDate || callDate >= startDate) &&
        (!endDate || callDate <= endDate)
      );
    });
  };

  // Dynamically filter calls
  const filteredCalls = getFilteredCalls();

  // Update pagination logic to work on filtered calls
  const totalPages = Math.ceil(filteredCalls.length / callsPerPage);
  const startIndex = (currentPage - 1) * callsPerPage;
  const currentCalls = filteredCalls.slice(
    startIndex,
    startIndex + callsPerPage
  );

  // Reset page to 1 when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/delete-call/${callUuid}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      alert(data.message); // Show success message
    } catch (error) {
      alert("Failed to delete call history");
    } finally {
      setSelectedCall(null);
      setCallUuid(null);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });

    return `${formattedDate}\n${formattedTime}`;
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  console.log("filter", filteredCalls);

  return (
    <>
      <Layout>
        <div className="">
          {activeCall ? (
            <div className="max-w-full  w-full mx-auto p-6  shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 ">
                <GiBackwardTime size={30} className="" /> Call History
              </h2>
              <div className="max-w-full w-full mx-auto p-6 shadow-lg rounded-lg">
                {/* Date Range Picker */}
                <div className="flex justify-between space-x-4 mb-4">
                  <div className="flex gap-2">
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => setDateRange(update)}
                      isClearable
                      placeholderText="Select Date Range"
                      className="px-4 py-2 placeholder:text-white bg-gray-700 text-white rounded cursor-pointer"
                    />
                  </div>
                  {/* Export to CSV */}
                  <CSVLink
                    data={filteredCalls}
                    headers={csvHeaders}
                    filename="call_history.csv"
                    className="px-4 py-2 flex items-center gap-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    <Upload /> Export
                  </CSVLink>
                </div>

                {/* Call History Table */}
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className="p-3 text-xs text-left">Time</th>
                      <th className="p-3 text-xs text-left">Call Duration</th>
                      <th className="p-3 text-xs text-left">Type</th>
                      <th className="p-3 text-xs text-center">Cost</th>
                      <th className="p-3 text-xs text-center">Call ID</th>
                      <th className="p-3 text-xs text-center">
                        Disconnection Reason
                      </th>
                      <th className="p-3 text-xs text-center">
                        User Sentiment
                      </th>
                      <th className="p-3 text-xs text-center">From</th>
                      <th className="p-3 text-xs text-center">To</th>
                      <th className="p-3 text-xs text-center">
                        Call Successful
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCalls.map((call, index) => (
                      <tr
                        onClick={() => {
                          setSelectedCall(call);
                          setCallUuid(call.caller_id);
                        }}
                        key={index}
                        className="border-b cursor-pointer border-gray-200 bg-gray-800 hover:bg-gray-700"
                      >
                        <td className="p-3 border border-gray-200">
                          {formatDateTime(call.start_time)}
                        </td>
                        <td className="p-3 border border-gray-200">
                          {calculateCallDuration(
                            call.start_time,
                            call.end_time
                          )}
                        </td>
                        <td className="p-3">{call.calltype}</td>
                        <td className="p-3 text-xs text-center">{call.cost}</td>
                        <td className="p-3 text-xs text-center">
                          {call.caller_id}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {call.disconnection_reason}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {call.user_sentiment}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {call.from_phone_number}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {call.plivo_phone_number}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {call.call_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-center mt-4 space-x-4">
                  <button
                    className={`px-4 py-2 bg-gray-700 text-white rounded ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-600"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-white text-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className={`px-4 py-2 bg-gray-700 text-white rounded ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-600"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>

              {selectedCall && (
                <div className="fixed   inset-0 flex justify-end bg-black bg-opacity-50">
                  <div className="w-[700px] overflow-y-auto bg-gray-950 p-5 text-white shadow-xl transition-transform transform translate-x-0">
                    <button
                      onClick={() => setSelectedCall(null)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                    >
                      ✖
                    </button>

                    {/* Call Details Header */}
                    <div className="flex items-start pt-8 justify-between">
                      <div
                        className="border-b border-white pb-3"
                        style={{ width: "100%" }}
                      >
                        <h2 className="text-base font-semibold flex gap-2">
                          <span>{formatDateTime(selectedCall.start_time)}</span>{" "}
                          {selectedCall.calltype}
                        </h2>
                        <p className="text-base">
                          agent ID: {selectedCall.agent_id}
                        </p>
                        <p className="text-base">
                          Duration:{" "}
                          {formatDateTime(selectedCall.start_time) +
                            " - " +
                            formatDateTime(selectedCall.end_time)}
                        </p>
                        <p className="text-base">Cost: ${selectedCall.cost}</p>

                        {/* Call Recording Player */}
                        {selectedCall.recording_url ? (
                          <div className="mt-2 flex pb-3 justify-start gap-8 w-full">
                            <audio controls className="w-1/2">
                              <source
                                src={selectedCall.recording_url}
                                type="audio/mpeg"
                              />
                              Your browser does not support the audio element.
                            </audio>
                            {/* Download Button */}
                            <button
                              onClick={() =>
                                handleDownload(
                                  selectedCall.recording_url,
                                  `recording-${
                                    selectedCall.id || Date.now()
                                  }.mp3`
                                )
                              }
                              className="mt-2 inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
                            >
                              <Download className="text-white" />
                            </button>
                          </div>
                        ) : null}

                        <div className="w-full border-spacing-1 h-[0.1rem] bg-gray-100"></div>
                      </div>
                      <div
                        onClick={handleDelete}
                        className="h-10 w-10 cursor-pointer border rounded-lg bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
                      >
                        <Trash className="text-white" />
                      </div>
                    </div>
                    {/* Call Details */}
                    <div className="w-full">
                      <h4 className="text-white ">Conversation Analysis</h4>
                      <p>Call Status: {selectedCall.call_status}</p>
                      <p>User Sentiment: {selectedCall.user_sentiment}</p>
                      <p>
                        Disconnection Reason:{" "}
                        {selectedCall.disconnection_reason}
                      </p>
                      <p>Model: {selectedCall.chatgpt_model}</p>
                      <p>Voice Name: {selectedCall.voice_name}</p>
                      <p>From: {selectedCall.from_phone_number}</p>
                      <p>To: {selectedCall.to}</p>
                      <p className="mt-3">Call Summary: </p>
                      <p className="text-sm">{selectedCall.summary}</p>
                      <div className="w-full border-spacing-1 h-[0.1rem] bg-gray-100"></div>
                    </div>
                    <div>
                      <h4>Call Transcription:</h4>
                      {selectedCall.chat_history
                        ?.sort(
                          (a, b) =>
                            new Date(a.timestamp) - new Date(b.timestamp)
                        ) // Sort by timestamp (oldest first)
                        .map((item, index, arr) => {
                          const firstTimestamp = new Date(
                            arr[0].timestamp
                          ).getTime(); // First message timestamp
                          const currentTimestamp = new Date(
                            item.timestamp
                          ).getTime(); // Current message timestamp
                          const elapsedTimeMs =
                            currentTimestamp - firstTimestamp;

                          // Convert milliseconds to minutes and seconds
                          const minutes = Math.floor(elapsedTimeMs / 60000);
                          const seconds = Math.floor(
                            (elapsedTimeMs % 60000) / 1000
                          );

                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <p className="text-base">
                                {item.role === "user" ? "User:" : "Agent:"}
                                <span className="text-sm"> {item.content}</span>
                              </p>
                              <p>
                                {minutes}:{seconds.toString().padStart(2, "0")}{" "}
                                {/* Elapsed time */}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="fade ">
              <div>
                <img
                  src={aiAgentImg.src}
                  width="400"
                  height="400"
                  alt="Agent illustration"
                />
                <h3 className="fade-text">
                  It appears there is no call history available at this time.
                </h3>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

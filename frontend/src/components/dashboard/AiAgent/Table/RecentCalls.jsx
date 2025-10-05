import React, { useRef, useState } from "react";
import { ChevronRight, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Pagination from "../../CallHistory/Pagination";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CallDetails from "../../CallHistory/CallDetails";
import { fetchSingleCallHistory } from "@/lib/api/ApiAiAssistant";

const RecentCalls = ({ calls = [], pagination = null, onPageChange }) => {
  const tableRef = useRef(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [callDetails, setCallDetails] = useState(null);

  // Limit displayed calls to 10 entries
  const displayedCalls = calls.slice(0, 10);

  const paginationData = pagination || {
    total: calls.length,
    page: 1,
    limit: 10,
    pages: Math.ceil(calls.length / 10),
  };

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);

      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  const handleRowClick = async (call) => {
    try {
      setSelectedCall(call);
      setLoading(true);

      // If we already have the original data, use it
      if (call.originalData) {
        setCallDetails(call.originalData);
        setLoading(false);
        return;
      }

      // Otherwise fetch the call details
      const response = await fetchSingleCallHistory(call.id);
      if (response.data) {
        setCallDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching call details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions from CallHistory.jsx
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ", " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
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

  const getStatusBadge = (status) => {
    const lowerStatus = status?.toLowerCase() || "";
    switch (lowerStatus) {
      case "successful":
      case "completed":
        return "bg-accent-teal/20 text-accent-teal";
      case "unsuccessful":
      case "missed":
        return "bg-sentiment-negative/20 text-sentiment-negative";
      case "transferred":
        return "bg-accent-purple/20 text-accent-purple";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="glass-panel px-4 pt-3 pb-5" ref={tableRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-white px-1">Recent Calls</h2>
        <Link
          href="/ai-assistant/call-history"
          className="flex no-underline items-center text-accent-teal text-sm hover:underline group"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {displayedCalls.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No recent calls found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedCalls.map((call) => (
                  <tr
                    key={call.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                    className="hover:bg-glass-panel-light/20 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(call)}
                  >
                    <td className="py-2 px-4 text-sm text-gray-400">
                      {call.date ? formatDate(call.date) : "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm text-white">
                      {call?.originalData?.plivo_phone_number || `web_${call.caller_id}` || "Unknown"}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-accent-teal/20 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-accent-teal" />
                        </div>
                        <span className="ml-3 text-sm text-gray-300">
                          {call.agent || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-300">
                      {call.duration || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentBadge(
                          call.sentiment
                        )}`}
                      >
                        {typeof call.sentiment === "string"
                          ? call.sentiment.charAt(0).toUpperCase() +
                            call.sentiment.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          call.status
                        )}`}
                      >
                        {typeof call.status === "string"
                          ? call.status.charAt(0).toUpperCase() +
                            call.status.slice(1)
                          : "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Only show pagination if we have more than 10 calls and pagination is enabled */}
          {paginationData.pages > 1 && pagination && (
            <div className="mt-4">
              <Pagination
                currentPage={paginationData.page}
                totalPages={paginationData.pages}
                totalItems={paginationData.total}
                itemsPerPage={paginationData.limit}
                setCurrentPage={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Call Details Sheet */}
      <Sheet
        open={!!selectedCall}
        onOpenChange={(open) => !open && setSelectedCall(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
            </div>
          ) : (
            callDetails && <CallDetails call={callDetails} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RecentCalls;

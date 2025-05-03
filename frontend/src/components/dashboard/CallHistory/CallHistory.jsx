import React, { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
// import FilterPanel from "./FilterPanel";
import Pagination from "./Pagination";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CallDetails from "./CallDetails";
import CallTable from "./CallTable";
import { fetchCallHistory } from "@/lib/api/ApiAiAssistant";
import { Loader2 } from "lucide-react";

const CallHistory = () => {
  // const [expandedFilters, setExpandedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadCallHistory = async () => {
      try {
        setLoading(true);
        const response = await fetchCallHistory();
        if (response.data && response.data.recordings) {
          setCallHistory(response.data.recordings);
        }
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCallHistory();
  }, []);

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

  const handleApplyFilters = () => {
    console.log("Applying filters");
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
  };

  const handleRowClick = (call) => {
    setSelectedCall(call);
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;

    if (isNaN(durationMs) || durationMs < 0) return "N/A";

    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const transformedCalls = callHistory.map((call) => ({
    id: call?._id,
    date: new Date(call?.created_time),
    caller_id: call?.caller_id || "Unknown",
    agent: call?.voice_name || "Unknown",
    duration: calculateDuration(call?.start_time, call?.end_time),
    sentiment: call?.user_sentiment?.toLowerCase() || "neutral",
    status: call?.call_status?.toLowerCase() || "unknown",
    originalData: call,
  }));

  const paginatedCalls = transformedCalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* <FilterPanel
          expanded={expandedFilters}
          setExpanded={setExpandedFilters}
          applyFilters={handleApplyFilters}
          clearFilters={handleClearFilters}
        /> */}

        {loading ? (
          <div className="glass-panel p-8 text-center">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-accent-teal" />
            </div>
          </div>
        ) : transformedCalls?.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <p className="text-gray-400">No call history found.</p>
          </div>
        ) : (
          <CallTable
            calls={paginatedCalls}
            formatDate={formatDate}
            getSentimentBadge={getSentimentBadge}
            getStatusBadge={getStatusBadge}
            onRowClick={handleRowClick}
          />
        )}

        <div
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          className="pt-1"
        />

        {!loading && transformedCalls?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(transformedCalls?.length / itemsPerPage)}
            totalItems={transformedCalls?.length}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        <Sheet
          open={!!selectedCall}
          onOpenChange={(open) => !open && setSelectedCall(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl overflow-y-auto"
          >
            {selectedCall && <CallDetails call={selectedCall?.originalData} />}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default CallHistory;

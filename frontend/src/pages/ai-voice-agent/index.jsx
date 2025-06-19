import React, { useState } from "react";
import MetricsCard from "@/components/dashboard/AiAgent/components/MetricsCard/MetricsCard";
import { tooltips } from "@/components/dashboard/AiAgent/utils";
import { PhoneCall, Clock, BarChart4, Target } from "lucide-react";
import ActivityChart from "@/components/dashboard/AiAgent/charts/ActivityChart";
import { Phone } from "lucide-react";
import { User } from "lucide-react";
import { Headphones } from "lucide-react";
import { Users } from "lucide-react";
import RecentCalls from "@/components/dashboard/AiAgent/Table/RecentCalls";
import Layout from "@/components/layout/Layout";
import useSWR, { mutate } from "swr";
import {
  dashboardStatsFetcher,
  callActivityChartFetcher,
} from "@/lib/api/ApiDashboard";
import { fetchCallHistory } from "@/lib/api/ApiAiAssistant";
import { LoaderIcon } from "lucide-react";
import useVoiceInfo from "@/hooks/useVoice";

const AiVoiceAgentDashboard = () => {
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Helper function to calculate duration - moved up before it's used
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

  // Fetch dashboard stats
  const {
    data: dashboardStats,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR("/api/dashboard-stats", dashboardStatsFetcher);

  // Fetch call activity chart data
  const {
    data: callHistoryData = {},
    error: chartError,
    isLoading: chartLoading,
  } = useSWR(
    `/api/call-activity-chart?period=${chartPeriod}`,
    callActivityChartFetcher
  );

  // Use the same API endpoint as call history
  const recentCallsKey = `/api/call-history?page=${currentPage}&limit=${limit}`;

  const {
    data: recentCallsData,
    error: callsError,
    isLoading: callsLoading,
  } = useSWR(
    recentCallsKey,
    async () => {
      const response = await fetchCallHistory(currentPage, limit);
      return response;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const handleRecentCallsPageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      // Mutate the SWR cache to trigger a refetch with the new page
      mutate(recentCallsKey);
    }
  };

  // Check if any data is loading
  const isLoading =
    statsLoading || chartLoading || callsLoading 

  // Handle errors
  const hasError = statsError || chartError || callsError;

  if (isLoading || !recentCallsData || !callHistoryData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoaderIcon className="w-8 h-8 animate-spin text-accent-teal" />
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh] flex-col">
          <p className="text-red-500 mb-2">Error loading dashboard data</p>
          <button
            className="px-4 py-2 bg-accent-teal text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

 

  const stats = dashboardStats?.data || {};

  // Transform the call history data to match the expected format
  const rawCalls = recentCallsData?.data?.recordings || [];

  const calls = rawCalls.map((call) => ({
    id: call?._id || call?.id,
    date: new Date(call?.created_time || call?.timestamp),
    caller_id: call?.caller_id || "Unknown",
    agent: call?.voice_name || call?.agent_name || "Unknown",
    duration:
      call?.duration ||
      (call?.start_time && call?.end_time
        ? calculateDuration(call?.start_time, call?.end_time)
        : "N/A"),
    sentiment: call?.user_sentiment?.toLowerCase() || "neutral",
    status: call?.call_status?.toLowerCase() || "unknown",
    originalData: call,
  }));

  // Create pagination object from the response
  const pagination = {
    total: recentCallsData?.data?.total || calls.length,
    page: currentPage,
    limit: limit,
    pages: Math.ceil((recentCallsData?.data?.total || calls.length) / limit),
  };
  const formatDuration = (durationInMinutes) => {
    if (!durationInMinutes || durationInMinutes <= 0) return "0:00";

    const totalSeconds = Math.floor(durationInMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Layout>
      <div className="space-y-6 overflow-hidden">
        {/* metrics cards */}
        {
          callHistoryData?.stats?.voiceMinutes?.remaining <= 0 &&
          <p className="text-red-500">Notification: You have no minutes left. Please recharge.</p>
        }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricsCard
            title="Total Calls"
            value={callHistoryData.stats?.totalCalls || 0}
            trend={stats.totalCalls?.change || 0}
            isPositiveTrend={stats.totalCalls?.change > 0}
            icon={<PhoneCall className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.totalCalls}
            breakdown={[
              {
                label: "Phone",
                value: callHistoryData.stats.phone.totalCalls || 0,
              },
              {
                label: "Web",
                value: callHistoryData.stats.web.totalCalls || 0,
              },
            ]}
          />

          <MetricsCard
            title="Total Duration"
            value={
              formatDuration(callHistoryData.stats.totalDuration) || "0:00"
            }
            trend={stats.avgCallDuration?.change || 0}
            isPositiveTrend={stats.avgCallDuration?.change > 0}
            isTime={true}
            icon={<Clock className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.avgCallDuration}
            breakdown={[
              {
                label: "Phone",
                value:
                  formatDuration(callHistoryData.stats.phone.totalDuration) ||
                  "0:00",
              },
              {
                label: "Web",
                value:
                  formatDuration(callHistoryData.stats.web.totalDuration) ||
                  "0:00",
              },
            ]}
          />

{/* remove format function and direclty show minutes */}
          <MetricsCard
            title="Minutes Used"
            value={callHistoryData.stats.voiceMinutes.used.toFixed(2) || 0}
            trend={stats.minutesUsed?.change || 0}
            isPositiveTrend={false}
            icon={<BarChart4 className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.minutesUsed}
          />


{/* remove format function and direclty show minutes */}
          <MetricsCard
            title="Minutes Remaining"
            value={
              callHistoryData.stats.voiceMinutes.remaining.toFixed(2)|| 0
            }
            trend={stats.minutesRemaining?.change || 0}
            isPositiveTrend={true}
            icon={<Target className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.minutesRemaining}
          />
        </div>

        {/* Call Activity Chart */}
        <ActivityChart
          data={callHistoryData.chartData || []}
          period={chartPeriod}
          setPeriod={setChartPeriod}
        />

        {/* Additional Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <MetricsCard
            title="Calls Over Time"
            value={stats.callsOverTime?.value || 0}
            trend={stats.callsOverTime?.change || 0}
            isPositiveTrend={stats.callsOverTime?.change > 0}
            icon={<PhoneCall className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.callsOverTime}
          />

          <MetricsCard
            title="Calls by AI Agent"
            value={stats.callsByAIAgent?.value || 0}
            trend={stats.callsByAIAgent?.change || 0}
            isPositiveTrend={stats.callsByAIAgent?.change > 0}
            icon={<Headphones className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.callsByAiAgent}
          />

          <MetricsCard
            title="Average Call Duration"
            value={stats.avgCallDuration?.formattedValue || "0:00"}
            trend={stats.avgCallDuration?.change || 0}
            isPositiveTrend={stats.avgCallDuration?.change > 0}
            isTime={true}
            icon={<Clock className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.avgCallDurationDetailed}
          />

          <MetricsCard
            title="Calls From Same Number"
            value={stats.callsFromSameNumber?.value || 0}
            trend={stats.callsFromSameNumber?.change || 0}
            isPositiveTrend={false}
            icon={<Phone className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.callsFromSameNumber}
          />

          <MetricsCard
            title="Unique Callers"
            value={stats.uniqueCallers?.value || 0}
            trend={stats.uniqueCallers?.change || 0}
            isPositiveTrend={true}
            icon={<User className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.uniqueCallers}
          />

          <MetricsCard
            title="Active AI Agents"
            value={stats.activeAIAgents?.value || 0}
            trend={stats.activeAIAgents?.change || 0}
            isPositiveTrend={true}
            icon={<Users className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.activeAiAgents}
          />
        </div>

        {/* Recent Calls with pagination */}
        <RecentCalls
          calls={calls}
          pagination={pagination}
          onPageChange={handleRecentCallsPageChange}
        />
      </div>
    </Layout>
  );
};

export default AiVoiceAgentDashboard;

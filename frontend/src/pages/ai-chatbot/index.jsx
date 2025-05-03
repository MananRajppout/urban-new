import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/dashboard/AiChatBot/components/card/Card";
import { Button } from "@/components/dashboard/AiChatBot/components/button/Button";
import {
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Info,
  Mail,
  Phone,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/dashboard/AiAgent/components/Popover/Popover";
import { ScrollArea } from "@/components/dashboard/AiChatBot/components/ScrollArea/ScrollArea";
import MetricsCard from "@/components/dashboard/AiAgent/components/MetricsCard/MetricsCard";
import { recentChats, tooltips } from "@/components/dashboard/AiChatBot/utils";
import { getPlatformIcon } from "@/components/dashboard/AiChatBot/utils/helper";
import { chatbotDashboardStatsFetcher } from "@/lib/api/ApiDashboard";
import { LoaderIcon } from "lucide-react";
import CustomTooltip from "@/components/dashboard/AiChatBot/components/Tooltip/Tooltip";
import { Zap } from "lucide-react";
import { Battery } from "lucide-react";
import useSWR from "swr";
import {
  messageActivityChartFetcher,
  peakTimeMessagesFetcher,
  uniqueVisitorsFetcher,
  recentMessagesFetcher,
} from "@/lib/api/ApiDashboard";
import Pagination from "@/components/dashboard/CallHistory/Pagination";

const ChatDashboard = () => {
  const router = useRouter();
  const [activeMetric, setActiveMetric] = useState("messages");
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  const {
    data: dashboardStats,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR("/api/chatbot-dashboard-stats", chatbotDashboardStatsFetcher);

  const {
    data: messageActivityData,
    error: messageActivityError,
    isLoading: messageActivityLoading,
  } = useSWR("/api/message-activity-chart", messageActivityChartFetcher);

  const {
    data: peakTimeData,
    error: peakTimeError,
    isLoading: peakTimeLoading,
  } = useSWR("/api/peak-message-times", peakTimeMessagesFetcher);

  const {
    data: uniqueVisitorsData,
    error: uniqueVisitorsError,
    isLoading: uniqueVisitorsLoading,
  } = useSWR("/api/unique-visitors", uniqueVisitorsFetcher);

  const {
    data: recentMessagesData,
    error: recentMessagesError,
    isLoading: recentMessagesLoading,
  } = useSWR(
    `/api/recent-messages?limit=${messagesPerPage}&page=${currentPage}`,
    recentMessagesFetcher
  );

  if (
    statsLoading ||
    messageActivityLoading ||
    peakTimeLoading ||
    uniqueVisitorsLoading ||
    recentMessagesLoading
  ) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoaderIcon className="w-8 h-8 animate-spin text-accent-teal" />
        </div>
      </Layout>
    );
  }

  if (
    statsError ||
    messageActivityError ||
    peakTimeError ||
    uniqueVisitorsError ||
    recentMessagesError
  ) {
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

  const stats = dashboardStats?.data || {
    totalChats: { value: 0, change: 0 },
    totalLeads: { value: 0, change: 0 },
    tokensUsed: { value: 0, change: 0 },
    remainingTokens: { value: 0, change: 0 },
  };

  // Transform API data for the chart
  const chartData =
    messageActivityData?.data?.categories.map((date, index) => ({
      name: date,
      messages: messageActivityData.data.series[0].data[index],
      tokens: messageActivityData.data.series[1].data[index],
      sessions: messageActivityData.data.series[2].data[index],
    })) || [];

  // Transform peak time data for the chart
  const formattedPeakTimeData =
    peakTimeData?.data.map((item) => ({
      time: item.timeSlot,
      percentage: item.count,
    })) || [];

  // Get unique visitors data
  const visitors = uniqueVisitorsData?.data || {
    last7Days: 0,
    last30Days: 0,
    growth: "0.0",
  };

  // Get recent messages data
  const recentMessages = recentMessagesData?.data?.messages || [];
  const pagination = recentMessagesData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: messagesPerPage,
    pages: 0,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white mb-0">
            AI Chatbot Dashboard
          </h1>
          <p className="text-gray-400 mb-0">
            View and manage your chatbot analytics and performance
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Chats"
            value={stats.totalChats.value}
            trend={stats.totalChats.change}
            isPositiveTrend={stats.totalChats.change >= 0}
            icon={<MessageSquare className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.totalChats}
          />

          <MetricsCard
            title="Total Leads"
            value={stats.totalLeads.value}
            trend={stats.totalLeads.change}
            isPositiveTrend={stats.totalLeads.change >= 0}
            icon={<Users className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.totalLeads}
          />

          <MetricsCard
            title="Tokens Used"
            value={stats.tokensUsed.value}
            trend={stats.tokensUsed.change}
            isPositiveTrend={stats.tokensUsed.change >= 0}
            icon={<Zap className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.tokensUsed}
          />

          <MetricsCard
            title="Remaining Tokens"
            value={stats.remainingTokens.value}
            trend={stats.remainingTokens.change}
            isPositiveTrend={stats.remainingTokens.change >= 0}
            icon={<Battery className="w-6 h-6 mt-2" />}
            infoTooltip={tooltips.remainingTokens}
          />
        </div>

        {/* Message Activity Chart */}
        <Card className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold text-white">
                {activeMetric === "messages"
                  ? "Message Activity"
                  : activeMetric === "tokens"
                  ? "Token Usage"
                  : "Session Activity"}
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Info className="h-4 w-4 cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                  {tooltips.messageActivity}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                style={{
                  border: "1px solid #27272a",
                  cursor: "pointer",
                }}
                variant={activeMetric === "messages" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveMetric("messages")}
              >
                Messages
              </Button>
              <Button
                style={{
                  border: "1px solid #27272a",
                  cursor: "pointer",
                }}
                variant={activeMetric === "tokens" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveMetric("tokens")}
              >
                Tokens
              </Button>
              <Button
                style={{
                  border: "1px solid #27272a",
                  cursor: "pointer",
                }}
                variant={activeMetric === "sessions" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveMetric("sessions")}
              >
                Sessions
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorMessages"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSessions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" width={30} padding={{ top: 20 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <Tooltip content={<CustomTooltip />} />
                {activeMetric === "messages" && (
                  <Area
                    type="monotone"
                    dataKey="messages"
                    name="Messages"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                )}
                {activeMetric === "tokens" && (
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    name="Tokens"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#colorTokens)"
                  />
                )}
                {activeMetric === "sessions" && (
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metrics Section - Restructured */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Peak Message Times - New Visualization */}
          <Card className="glass-panel py-0 px-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <div className="flex items-center gap-1.5">
                <h3 className="text-md font-semibold text-white">
                  Peak Message Times
                </h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                    {tooltips.peakTimes}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedPeakTimeData}>
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel p-2 backdrop-blur-lg border border-subtle-border">
                            <p className="text-xs font-medium text-white">
                              {label}
                            </p>
                            <p className="text-xs text-blue-400">
                              Messages: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Unique Visitors - Keep this panel */}
          <Card className="glass-panel py-0 px-4">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <div className="flex items-center gap-1.5">
                <h3 className="text-md font-semibold text-white">
                  Unique Visitors
                </h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
                    {tooltips.uniqueVisitors}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Last 7 days</span>
                <span className="text-sm font-medium text-white">
                  {visitors.last7Days}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Last 30 days</span>
                <span className="text-sm font-medium text-white">
                  {visitors.last30Days}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Growth</span>
                <span
                  className={`text-sm font-medium ${
                    parseFloat(visitors.growth) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {parseFloat(visitors.growth) >= 0 ? "+" : ""}
                  {visitors.growth}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Messages - Updated to use simple HTML table */}
        <Card className="glass-panel py-4 px-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Messages
          </h2>
          <ScrollArea className="h-[350px]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Platform
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.map((chat) => (
                    <tr
                      key={chat.id}
                      className="border-b border-gray-700 hover:bg-glass-panel-light/20 transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              chat.platform === "website"
                                ? "rgba(59, 130, 246, 0.2)"
                                : chat.platform === "facebook"
                                ? "rgba(99, 102, 241, 0.2)"
                                : chat.platform === "whatsapp"
                                ? "rgba(34, 197, 94, 0.2)"
                                : "rgba(236, 72, 153, 0.2)",
                          }}
                        >
                          {getPlatformIcon(chat.platform)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{chat.name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-300 line-clamp-1">
                          {chat.message}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400">
                          {chat.time}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {chat.contact?.email !== "No email provided" ||
                        chat.contact?.phone !== "No phone provided" ? (
                          <div className="flex flex-col">
                            {chat.contact?.email !== "No email provided" && (
                              <div className="flex items-center text-xs text-gray-400">
                                <Mail className="h-3 w-3 mr-1" />
                                <span>{chat.contact.email}</span>
                              </div>
                            )}
                            {chat.contact?.phone !== "No phone provided" && (
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{chat.contact.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No contact info
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#27272a",
                            },
                          }}
                          onClick={() =>
                            router.push(`/chat-details/${chat.id}`)
                          }
                        >
                          View Chat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          {/* Pagination Component */}
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              setCurrentPage={setCurrentPage}
            />
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/chat-history")}
            >
              View All Messages
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ChatDashboard;

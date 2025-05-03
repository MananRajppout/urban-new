import AxiosInstance from "@/lib/axios";

export async function getDashboardStats() {
  return await AxiosInstance.get("/api/dashboard-stats");
}

export async function getCallActivityChart(period = "daily") {
  return await AxiosInstance.get(`/api/call-activity-chart?period=${period}`);
}

export async function getRecentCalls(limit = 10, page = 1) {
  return await AxiosInstance.get(
    `/api/recent-calls?limit=${limit}&page=${page}`
  );
}

export async function getChatBotDashboardStats() {
  return await AxiosInstance.get("/api/chatbot-dashboard-stats");
}

export async function getMessageActivityChart() {
  return await AxiosInstance.get("/api/message-activity-chart");
}

export async function getPeakTimeMessages() {
  return await AxiosInstance.get("/api/peak-message-times");
}

export async function getUniqueVisitors() {
  return await AxiosInstance.get("/api/unique-visitors");
}

export async function getRecentMessages(limit = 10, page = 1) {
  return await AxiosInstance.get(
    `/api/recent-messages?limit=${limit}&page=${page}`
  );
}

export const dashboardStatsFetcher = async () => {
  const response = await getDashboardStats();
  return response.data;
};

export const callActivityChartFetcher = async (url) => {
  const period = url.split("=")[1] || "daily";
  const response = await getCallActivityChart(period);
  return response.data.data
};

export const recentCallsFetcher = async (url) => {
  const params = new URLSearchParams(url.split("?")[1]);
  const limit = params.get("limit") || 10;
  const page = params.get("page") || 1;
  const response = await getRecentCalls(limit, page);
  return response.data;
};

export const chatbotDashboardStatsFetcher = async () => {
  const response = await getChatBotDashboardStats();
  return response.data;
};

export const messageActivityChartFetcher = async () => {
  const response = await getMessageActivityChart();
  return response.data;
};

export const peakTimeMessagesFetcher = async () => {
  const response = await getPeakTimeMessages();
  return response.data;
};

export const uniqueVisitorsFetcher = async () => {
  const response = await getUniqueVisitors();
  return response.data;
};

export const recentMessagesFetcher = async (url) => {
  const params = new URLSearchParams(url.split("?")[1]);
  const limit = params.get("limit") || 5;
  const page = params.get("page") || 1;
  const response = await getRecentMessages(limit, page);
  return response.data;
};

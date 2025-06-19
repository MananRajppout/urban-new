import AxiosInstance from "@/lib/axios";

export async function getDashboardStats() {
  return await AxiosInstance.get("/api/dashboard-stats");
}


export async function getSuperAdminDelete(id) {
  return await AxiosInstance.delete(`/api/fetch-super-delete-user/${id}`);
}

export async function getSuperAdminAllCustomer(startDate,endDate,searchQuery,page=1,limit=10) {
  const params = new URLSearchParams();
  if(startDate) params.set("startDate",startDate)
  if(endDate) params.set("endDate",endDate)
  if(page) params.set("page",page)
  if(limit) params.set("limit",limit)
  if(searchQuery) params.set("search",searchQuery)
  return await AxiosInstance.get(`/api/fetch-all-customer?${params.toString()}`);
}


export async function getSuperAdminDashboardStats(startDate,endDate) {
  const params = new URLSearchParams();
  if(startDate) params.set("startDate",startDate)
  if(endDate) params.set("endDate",endDate)
  return await AxiosInstance.get(`/api/fetch-super-admin-dashboard-data?${params.toString()}`);
}

export async function getSuperAdminUserDashboardStats(startDate,endDate,user_id) {
  const params = new URLSearchParams();
  if(startDate) params.set("startDate",startDate)
  if(endDate) params.set("endDate",endDate)
  if(user_id) params.set("user_id",user_id)
  return await AxiosInstance.get(`/api/fetch-super-admin-user-dashboard-data?${params.toString()}`);
}


export async function superAdminUserassignminutes(user_id,minutes) {
  return await AxiosInstance.post(`/api/fetch-super-admin-user-assisgn-minutes`,{user_id,minutes},{headers: {
    "Content-Type": "application/json"
  }});
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

export const superAdmindashboardStatsFetcher = async (startDate,endDate) => {
  const response = await getSuperAdminDashboardStats(startDate,endDate);
  return response.data;
};

export const superAdminUserdashboardStatsFetcher = async (startDate,endDate,user_id) => {
  const response = await getSuperAdminUserDashboardStats(startDate,endDate,user_id);
  return response.data;
};

export const superAdmindashboardcustomerfetcher = async (startDate,endDate,searchQuery,page=1,limit=10) => {
  const response = await getSuperAdminAllCustomer(startDate,endDate,searchQuery,page,limit);
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

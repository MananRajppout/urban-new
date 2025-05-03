import AxiosInstance from "@/lib/axios";
import useSWR from "swr";

export function useCount({ id, range: { to, from } = {}, period }) {
  const queryParams = {
    chat_model_id: id,
    to,
    from,
    period,
  };
  const queryString = new URLSearchParams(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined)
  ).toString();
  const { data, error, isLoading } = useSWR(
    `/api/stats/counts?${queryString}`,
    AxiosInstance.get
  );

  return {
    data: data?.data?.data,
    error,
    isLoading,
  };
}

export function useSessionsVsTime({ id, range: { to, from } = {}, period }) {
  const { data, error, isLoading } = useSWR(
    `/api/stats/sessions-vs-time?chat_model_id=${id}&to=${to}&from=${from}&period=${period}`,
    AxiosInstance.get
  );

  return {
    data: data?.data?.data,
    error,
    isLoading,
  };
}

export function useChatsVsTime({ id, range: { to, from } = {}, period }) {
  const { data, error, isLoading } = useSWR(
    `/api/stats/chats-vs-time?chat_model_id=${id}&to=${to}&from=${from}&period=${period}`,
    AxiosInstance.get
  );

  return {
    data: data?.data?.data,
    error,
    isLoading,
  };
}

export function useChartData({ id, range: { to, from } = {}, period }) {
  const queryParams = {
    chat_model_id: id,
    to,
    from,
    period,
  };
  const queryString = new URLSearchParams(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined)
  ).toString();
  const { data, error, isLoading } = useSWR(
    `/api/stats/chart-data?${queryString}`,
    AxiosInstance.get
  );
  const {
    sessions = [],
    leads = [],
    chats = [],
    chatModels = [],
  } = data?.data?.data || {};
  const sessionData = [
    {
      name: "Sessions",
      data: sessions,
    },
  ];
  const leadData = [
    {
      name: "Leads",
      data: leads,
    },
  ];
  const chatData = [
    {
      name: "Chats",
      data: chats,
    },
  ];
  const chatBoxData = [
    {
      name: "Chat Box",
      data: chatModels,
    },
  ];
  return {
    sessionData,
    leadData,
    chatData,
    chatBoxData,
    error,
    isLoading,
  };
}

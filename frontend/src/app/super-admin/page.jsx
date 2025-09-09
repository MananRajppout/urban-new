'use client';

import ChartsSection from '@/components/admin/dashboard/ChartSection';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatCardsGrid from '@/components/admin/dashboard/StatCardsGrid';
import { dateRangeOptions } from '@/data/dateRangeOption';
import { superAdmindashboardStatsFetcher } from '@/lib/api/ApiDashboard';
import { getUserDetail } from '@/lib/api/ApiExtra';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';




export default function DashboardPage() {
  const [startDate, setStartDate] = useState(dateRangeOptions[4].getRange()[0]);
  const [endDate, setEndDate] = useState(dateRangeOptions[4].getRange()[1]);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(0);


  useEffect(() => {
    const fetchRemainingMinutes = async () => {
      const res = await getUserDetail();
      setRemainingMinutes(res.data.remaining_minutes);
      console.log(res.data.remaining_minutes);
    }
    fetchRemainingMinutes();
  }, []);

  // const {
  //   data: dashboardStats,
  //   isLoading: statsLoading,
  // } = useSWR("/api/fetch-super-admin-dashboard-data", () => superAdmindashboardStatsFetcher(startDate,endDate));

  const fetchUsers = async (startDate, endDate) => {
    setIsLoading(true)
    try {
      const res = await superAdmindashboardStatsFetcher(startDate, endDate);
      setData(res);
    } catch (error) {
      console.log(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchUsers(startDate, endDate);
  }, [startDate, endDate])

  const handleDateRangeChange = (range) => {
    const start = range[0];
    const end = range[1];
    setStartDate(start);
    setEndDate(end);
  };



  return (
    <div className="space-y-6">
      <DashboardHeader heading="Dashboard" text="View your business metrics and performance." showDateRange showDownload showDocs onDateRangeChange={handleDateRangeChange} />

      {
        isLoading &&
        <div className="w-full flex items-center justify-center h-[30rem]">
          <Loader2 className="text-green-500 animate-spin" size={45} />
        </div>
      }

      {
        !isLoading && data?.chartData &&
        <ChartsSection chartData={data.chartData} />
      }


      {
        !isLoading &&
        <StatCardsGrid dashboardStats={data} remainingMinutes={remainingMinutes} />
      }

    </div>
  );
}

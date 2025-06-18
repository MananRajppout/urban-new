'use client';

import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatCardsGrid from '@/components/admin/dashboard/StatCardsGrid';
import { dateRangeOptions } from '@/data/dateRangeOption';
import { superAdmindashboardStatsFetcher } from '@/lib/api/ApiDashboard';
import { useState } from 'react';
import useSWR,{ mutate } from 'swr';




export default function DashboardPage() {
  const [startDate,setStartDate] = useState(dateRangeOptions[4].getRange()[0]);
  const [endDate,setEndDate] = useState(dateRangeOptions[4].getRange()[1]);

  const {
    data: dashboardStats,
    isLoading: statsLoading,
  } = useSWR("/api/fetch-super-admin-dashboard-data", () => superAdmindashboardStatsFetcher(startDate,endDate));


  const handleDateRangeChange = (range) => {
    const start = range[0];
    const end = range[1];
    setStartDate(start);
    setEndDate(end)
    mutate("/api/fetch-super-admin-dashboard-data");
  };

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Dashboard" text="View your business metrics and performance." showDateRange showDownload showDocs onDateRangeChange={handleDateRangeChange}/>
      <StatCardsGrid dashboardStats={dashboardStats}/>
    </div>
  );
}

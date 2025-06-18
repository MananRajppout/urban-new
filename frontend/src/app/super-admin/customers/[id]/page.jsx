'use client';

import CustomerDashbaordHeader from '@/components/admin/customers/CustomerDashbaordHeader';
import CustomerStatCardsGrid from '@/components/admin/customers/CustomerStatsGrid';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatCardsGrid from '@/components/admin/dashboard/StatCardsGrid';
import { dateRangeOptions } from '@/data/dateRangeOption';
import { superAdmindashboardStatsFetcher, superAdminUserassignminutes, superAdminUserdashboardStatsFetcher } from '@/lib/api/ApiDashboard';
import { useState } from 'react';
import useSWR,{ mutate } from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';




export default function DashboardPage({params}) {
  const  {id} = params;
  const [startDate,setStartDate] = useState(dateRangeOptions[4].getRange()[0]);
  const [endDate,setEndDate] = useState(dateRangeOptions[4].getRange()[1]);
  const [assisgnMinutesOpen,setAssignMinutesOpen] = useState(false);
  const [assignMinutesValue, setAssignMinutesValue] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  
  const {
    data: dashboardStats,
    isLoading: statsLoading,
  } = useSWR("/api/fetch-super-admin-user-dashboard-data", () => superAdminUserdashboardStatsFetcher(startDate,endDate,id));


  const handleDateRangeChange = (range) => {
    const start = range[0];
    const end = range[1];
    setStartDate(start);
    setEndDate(end)
    mutate("/api/fetch-super-admin-user-dashboard-data");
  };

  const handleAssignMinutes = () => {
    setAssignMinutesOpen(true);
  }

  const handleAssignDialogClose = () => {
    setAssignMinutesOpen(false);
    setAssignMinutesValue('');
    setAssignLoading(false);
  };

  const handleAssign = async () => {
    if (!assignMinutesValue || isNaN(assignMinutesValue) || Number(assignMinutesValue) <= 0) {
      toast.error('Please enter a valid number of minutes.');
      return;
    }
    setAssignLoading(true);
    try {
      // TODO: Replace with actual API call to assign minutes
      const res = await superAdminUserassignminutes(id,assignMinutesValue)
      toast.success(res.data?.message);
      handleAssignDialogClose();
      // Optionally refresh dashboard data here
      mutate("/api/fetch-super-admin-user-dashboard-data");
    } catch (e) {
      toast.error('Failed to assign minutes.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CustomerDashbaordHeader heading={`${dashboardStats?.data?.user?.full_name} Dashaboard`} handleAssignMinutes={handleAssignMinutes} text="View your business metrics and performance." showDateRange showDownload showDocs onDateRangeChange={handleDateRangeChange}/>
      <CustomerStatCardsGrid dashboardStats={dashboardStats}/>

      <Dialog open={assisgnMinutesOpen} onOpenChange={setAssignMinutesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Minutes</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label htmlFor="minutes" className="block mb-2 text-sm font-medium">Number of Minutes</label>
            <Input
              id="minutes"
              type="number"
              min={1}
              value={assignMinutesValue}
              onChange={e => setAssignMinutesValue(e.target.value)}
              placeholder="Enter minutes to assign"
              disabled={assignLoading}
              className="text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-white" onClick={handleAssignDialogClose} disabled={assignLoading}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignLoading || !assignMinutesValue}>
              {assignLoading ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

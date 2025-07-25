'use client';

import CustomerDashbaordHeader from '@/components/admin/customers/CustomerDashbaordHeader';
import CustomerStatCardsGrid from '@/components/admin/customers/CustomerStatsGrid';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import StatCardsGrid from '@/components/admin/dashboard/StatCardsGrid';
import { dateRangeOptions } from '@/data/dateRangeOption';
import { superAdmindashboardStatsFetcher, superAdminUserassignminutes, superAdminUserdashboardStatsFetcher } from '@/lib/api/ApiDashboard';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Phone, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import UserChartsSection from '@/components/admin/customers/UserChartsSection';


export default function DashboardPage({ params }) {
  const { id } = params;
  const [startDate, setStartDate] = useState(dateRangeOptions[4].getRange()[0]);
  const [endDate, setEndDate] = useState(dateRangeOptions[4].getRange()[1]);
  const [assisgnMinutesOpen, setAssignMinutesOpen] = useState(false);
  const [assignMinutesValue, setAssignMinutesValue] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [dashboardStats, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showWhiteLabelOpntion, setWhiteLabelOption] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isOriginSame = window.location.hostname == process.env.NEXT_PUBLIC_MAIN_DOMAIN;
      setWhiteLabelOption(isOriginSame);
    }
  }, [id]);

  // const {
  //   data: dashboardStats,
  //   isLoading: statsLoading,
  // } = useSWR("/api/fetch-super-admin-user-dashboard-data", () => superAdminUserdashboardStatsFetcher(startDate,endDate,id));

  const fetchUsers = async (startDate, endDate) => {
    setIsLoading(true)
    try {
      const res = await superAdminUserdashboardStatsFetcher(startDate, endDate, id);
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
    setEndDate(end)
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
      const res = await superAdminUserassignminutes(id, assignMinutesValue)
      if(res.data.success){
        toast.success(res.data?.message);
        handleAssignDialogClose();
        fetchUsers(startDate, endDate);
      }else{
        toast.error(res.data?.message);
      }
    
    } catch (e) {
      toast.error('Failed to assign minutes.');
    } finally {
      setAssignLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <CustomerDashbaordHeader showWhiteLabelOpntion={showWhiteLabelOpntion} heading={`${dashboardStats?.data?.user?.full_name} Dashaboard`} handleAssignMinutes={handleAssignMinutes} text="View your business metrics and performance." showDateRange showDownload showDocs onDateRangeChange={handleDateRangeChange} />

      {
        isLoading &&
        <div className="w-full flex items-center justify-center h-[30rem]">
          <Loader2 className="text-green-500 animate-spin" size={45} />
        </div>
      }

      {
        !isLoading &&
        <UserChartsSection chartData={dashboardStats?.data?.chartData} />
      }

      {
        !isLoading &&
        <CustomerStatCardsGrid dashboardStats={dashboardStats} />
      }

      {
        !isLoading &&
        <>
          <h1 className="text-xl font-medium text-white mt-10">Phone Numbers</h1>
          <div className="glass-panel rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats?.data?.phoneNumbers?.map((phoneNumber) => (
                  <TableRow
                    key={phoneNumber._id}
                    className="hover:bg-glass-panel-light/20 cursor-pointer"
                    onClick={() => handleRowClick(phoneNumber, phoneNumber._id)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center mr-3">
                          <Phone className="w-5 h-5 text-accent-teal" />
                        </div>
                        <span>{phoneNumber.phone_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${phoneNumber.agent_name
                          ? "bg-sentiment-positive/20 text-sentiment-positive"
                          : "bg-gray-500/20 text-gray-400"
                          }`}
                      >
                        {phoneNumber.status || "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {phoneNumber.number_location
                        ? phoneNumber.number_location
                        : phoneNumber.country === "IN"
                          ? "India"
                          : "United States"}
                    </TableCell>

                    <TableCell className="text-right">
                      {new Date() > new Date(phoneNumber.renewal_date) ? (
                        <>Expired</>
                      ) : (
                        new Date(phoneNumber.renewal_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      }


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

'use client';

import { useEffect, useRef, useState } from "react";
import CustomersHeader from "@/components/admin/customers/CustomersHeader";
import CustomersSearch from "@/components/admin/customers/CustomersSearch";
import CustomersTabs from "@/components/admin/customers/CustomersTabs";
import CustomersTable, { SortField, SortOrder } from "@/components/admin/customers/CustomersTable";
import CustomersPagination from "@/components/admin/customers/CustomersPagination";
import useSWR, { mutate } from "swr";
import { getSuperAdminDelete, superAdmindashboardcustomerfetcher } from "@/lib/api/ApiDashboard";
import { dateRangeOptions } from "@/data/dateRangeOption";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState("dateJoined");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(dateRangeOptions[6].getRange()[0]);
  const [endDate, setEndDate] = useState(dateRangeOptions[6].getRange()[1]);
  const [data,setData] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [query,setQuery] = useState('')

  // const {
  //   data,
  //   isLoading,
  // } = useSWR("/api/fetch-all-customer", () => superAdmindashboardcustomerfetcher(startRef.current, endRef.current, searchQuery, page, 10));

  const fetchUsers = async (startDate,endDate,query,page) => {
    setIsLoading(true)
    try {
      const res = await superAdmindashboardcustomerfetcher(startDate,endDate, query, page, 10);
      setData(res);
    } catch (error) {
      console.log(error.message)
    }finally{
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchUsers(startDate,endDate,query,page);
  },[startDate,endDate,query,page])

  const handleDateRangeChange = (range) => {
    const start = range[0];
    const end = range[1];
    setStartDate(start);
    setEndDate(end)
    
  };

  const handlePageChange = (pagenum) => {
    setPage(pagenum);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(searchQuery)
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchQuery])


  const handleDeleteUser = async (id) => {
    try {
      const res = await getSuperAdminDelete(id);
      fetchUsers(startDate,endDate,query,page);
    } catch (error) {
    }
  }



  return (
    <div className="space-y-6">
      <CustomersHeader onDateRangeChange={handleDateRangeChange} />

      <CustomersSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* <CustomersTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      > */}
      {
        !isLoading &&
        <CustomersTable
          searchQuery={searchQuery}
          activeTab={activeTab}
          sortField={sortField}
          sortOrder={sortOrder}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          data={data}
          handleDeleteUser={handleDeleteUser}
        />
      }

      {
        isLoading &&
        <div className="w-full flex items-center justify-center h-[30rem]">
          <Loader2 className="text-green-500 animate-spin" size={45}/>
        </div>
      }


      {
        !isLoading &&
        <CustomersPagination data={data} handlePageChange={handlePageChange} />
      }
      {/* </CustomersTabs> */}
    </div>
  );
}

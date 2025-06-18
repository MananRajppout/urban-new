'use client';

import { useEffect, useState } from "react";
import CustomersHeader from "@/components/admin/customers/CustomersHeader";
import CustomersSearch from "@/components/admin/customers/CustomersSearch";
import CustomersTabs from "@/components/admin/customers/CustomersTabs";
import CustomersTable, { SortField, SortOrder } from "@/components/admin/customers/CustomersTable";
import CustomersPagination from "@/components/admin/customers/CustomersPagination";
import useSWR, { mutate } from "swr";
import { superAdmindashboardcustomerfetcher } from "@/lib/api/ApiDashboard";
import { dateRangeOptions } from "@/data/dateRangeOption";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortField, setSortField] = useState("dateJoined");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page,setPage] = useState(1);
  const [startDate,setStartDate] = useState(dateRangeOptions[4].getRange()[0]);
  const [endDate,setEndDate] = useState(dateRangeOptions[4].getRange()[1]);


  const {
    data,
    isLoading,
  } = useSWR("/api/fetch-all-customer", () => superAdmindashboardcustomerfetcher(startDate,endDate,searchQuery,page,10));


  const handleDateRangeChange = (range) => {
    const start = range[0];
    const end = range[1];
    setStartDate(start);
    setEndDate(end)
    mutate("/api/fetch-all-customer");
  };

  const handlePageChange = (pagenum) => {
    setPage(pagenum);
    mutate("/api/fetch-all-customer");
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      mutate("/api/fetch-all-customer");
    },1000);

    return () => clearTimeout(timeout);
  },[searchQuery])



  return (
    <div className="space-y-6">
      <CustomersHeader onDateRangeChange={handleDateRangeChange} />
      
      <CustomersSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CustomersTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <CustomersTable 
          searchQuery={searchQuery}
          activeTab={activeTab}
          sortField={sortField}
          sortOrder={sortOrder}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          data={data}
        />
        
        <CustomersPagination data={data} handlePageChange={handlePageChange}/>
      </CustomersTabs>
    </div>
  );
}

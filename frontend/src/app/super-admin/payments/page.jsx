'use client';

import { useState } from "react";
import PaymentsHeader from "@/components/admin/payments/PaymentsHeader";
import PaymentsSearch from "@/components/admin/payments/PaymentsSearch";
import PaymentsTabs from "@/components/admin/payments/PaymentsTabs";
import PaymentsTable from "@/components/admin/payments/PaymentsTable";
import PaymentsPagination from "@/components/admin/payments/PaymentsPagination";

export default function Payments({ remainingMinutes }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [, setDateRange] = useState([
    new Date(),
    new Date(),
  ]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    console.log("Date range changed:", range);
  };

  return (
    <div className="space-y-6">
      <PaymentsHeader onDateRangeChange={handleDateRangeChange} />
      
      <PaymentsSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <PaymentsTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <PaymentsTable 
          searchQuery={searchQuery}
          activeTab={activeTab}
        />
        
        <PaymentsPagination />
      </PaymentsTabs>
    </div>
  );
}

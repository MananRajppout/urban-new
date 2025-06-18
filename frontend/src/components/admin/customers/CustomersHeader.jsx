'use client';
import { Download } from "lucide-react";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";



export default function CustomersHeader({ onDateRangeChange }) {
  const router = useRouter();
  
  const handleDownloadList = () => {
    console.log("Downloading customer list for selected date range");
    alert("Customer list download started for the selected date range.");
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="flex gap-2">
        <DateRangePicker onRangeChange={onDateRangeChange} />
        <Button 
          variant="outline" 
          className="bg-dark-200 border-none text-white"
          onClick={handleDownloadList}
        >
          <Download size={16} className="mr-2" />
          Download
        </Button>
        <Button 
          variant="outline" 
          className="bg-dark-200 border-none text-white"
          onClick={() => router.push("/admin/documentation/customers")}
        >
          Documentation
        </Button>
      </div>
    </div>
  );
}

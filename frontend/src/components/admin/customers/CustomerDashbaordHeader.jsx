'use client';

import { Download } from 'lucide-react';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';


export default function CustomerDashbaordHeader({
  heading,
  text,
  showDateRange = false,
  showDownload = false,
  showDocs = false,
  onDateRangeChange,
  handleAssignMinutes,
  showWhiteLabelOpntion
}) {
  const router = useRouter();

  const handleDownloadReport = () => {
    console.log('Downloading report for date range');
    alert('Dashboard report download started for the selected date range.');
  };

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          {text && <p className="mt-1 text-muted-foreground">{text}</p>}
        </div>
        <div className="flex gap-2">
          {showDateRange && onDateRangeChange && (
            <DateRangePicker onRangeChange={onDateRangeChange}/>
          )}
          {showDownload && (
            <Button variant="outline" onClick={handleDownloadReport} className="text-white border-none cursor-pointer bg-dark-200">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          {true && (
            <Button variant="outline" onClick={handleAssignMinutes} className="text-white border-none cursor-pointer bg-dark-200">
              <Clock className="mr-2 h-4 w-4" />
              Assign Minutes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

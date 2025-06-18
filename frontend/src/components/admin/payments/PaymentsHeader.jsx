import { Download } from 'lucide-react';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


export default function PaymentsHeader({ onDateRangeChange }) {
  const router = useRouter();

  const handleDownloadReport = () => {
    console.log('Downloading payment report');
    alert('Payment report download started for the selected date range.');
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="flex gap-2">
        <DateRangePicker onRangeChange={onDateRangeChange} />
        <Button
          variant="outline"
          className="border-dark-100 bg-dark-200 text-white border-none"
          onClick={handleDownloadReport}
        >
          <Download size={16} className="mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          className="border-dark-100 bg-dark-200 text-white border-none"
          onClick={() => router.push('/admin/documentation/payments')}
        >
          Documentation
        </Button>
      </div>
    </div>
  );
}

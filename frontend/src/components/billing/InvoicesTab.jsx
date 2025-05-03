

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getStatusStyle } from './billingUtils';
import { useEffect, useState } from 'react';
import { getPaymentHistory } from '@/lib/api/ApiBilling';
import { ConsoleView } from 'react-device-detect';
import { format, parseISO } from 'date-fns';

const InvoicesTab = ({ dateRange,filterOpen}) => {
  const isMobile = useIsMobile();
    const [currentPage, setCurrentPage] = useState(1);
    const [invoiceData, setInvoiceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records for pagination
    const itemsPerPage = 5;
  
  
    useEffect(() => {
      // Fetch data when component mounts or when dateRange changes
  
      const fetchinvoices = async () => {
        setLoading(true);
        try {
        
          const response = await getPaymentHistory(dateRange.from, dateRange.to, currentPage);
          setInvoiceData(response.data);
          setTotalRecords(response.totalRecords); // Assuming backend returns total records
        } catch (error) {
          console.error("Error fetching payment history:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchinvoices();
    }, [filterOpen, currentPage]); // Re-run when dateRange or currentPage changes
  
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const paginatationInoviceData= invoiceData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  
    const handlePageChange = (page) => {
      if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    };



  return (
    <div className="glass-panel rounded-lg overflow-x-auto">
      {!isMobile ? (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-subtle-border">
              <TableHead className="text-gray-400">Invoice #</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Amount</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatationInoviceData&&paginatationInoviceData.map((invoice) => (
              <TableRow key={invoice.invoice_number} className="border-b border-subtle-border">
                <TableCell className="py-4 text-white">{invoice.invoice_number}</TableCell>
                <TableCell className="text-white">  {format(parseISO(invoice.created_time), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-white">      ₹{invoice.cost.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(invoice.payment_status)}`}>
                    {invoice.payment_status}
                  </span>
                </TableCell>
                <TableCell>
              
                         <a
                  href={invoice.invoice_url}
                  download
                
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-accent-teal">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </a>
               
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="space-y-4 p-4">
          {paginatationInoviceData&&paginatationInoviceData.map((invoice) => (
            <div key={invoice.invoice_number}className="glass-panel border-l-2 border-subtle-border p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <div className="text-white font-medium">{invoice.invoice_number}</div>
                  <div className="text-gray-400 text-sm">{format(parseISO(invoice.created_time), 'MMM dd, yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">  ₹{invoice.cost.toFixed(2)}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(invoice.payment_status)}`}>
                    {invoice.paymetn_status}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-subtle-border">
            
              <a
                  href={invoice.invoice_url}
                  download

                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-accent-teal">
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;

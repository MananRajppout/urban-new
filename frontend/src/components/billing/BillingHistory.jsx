import { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { isWithinInterval, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

import TransactionTableRow from './TransactionTableRow';
import TransactionMobileCard from './TransactionMobileCard';
import TransactionPagination from './TransactionPagination';
import { getPaymentHistory } from '@/lib/api/ApiBilling';

const BillingHistory = ({ dateRange ,filterOpen}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records for pagination
  const itemsPerPage = 5;
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fetch data when component mounts or when dateRange changes
    const fetchTransactions = async () => {
      setLoading(true);
      try {
      
        const response = await getPaymentHistory(dateRange.from, dateRange.to, currentPage);
        setTransactions(response.data);
        console.log(response.data,'check here for response data')
        setTotalRecords(response.totalRecords); // Assuming backend returns total records
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filterOpen, currentPage]); // Re-run when dateRange or currentPage changes

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderMobileView = () => (
    <div className="space-y-4">
      {paginatedTransactions?.map((transaction) => (
        <TransactionMobileCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-subtle-border">
          <TableHead className="text-gray-400">Date</TableHead>
          <TableHead className="text-gray-400">Description</TableHead>
          <TableHead className="text-gray-400">Amount</TableHead>
          <TableHead className="text-gray-400">Payment Method</TableHead>
          <TableHead className="text-gray-400">Invoice</TableHead>
          <TableHead className="text-gray-400 text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedTransactions?.map((transaction) => (
          <TransactionTableRow key={transaction.id} transaction={transaction} />
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : transactions.length > 0 ? (
          isMobile ? renderMobileView() : renderDesktopView()
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p>No transactions found for the selected date range.</p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-400 gap-2">
            <div>
              Showing {Math.min(currentPage * itemsPerPage, transactions?.length) - ((currentPage - 1) * itemsPerPage)} of {transactions?.length} transactions
           
            </div>
            <div className="text-right">
              <span className="mr-2">Total billed:</span>
              <span className="text-white font-medium">
              ₹
                {paginatedTransactions?.reduce((sum, transaction) => sum + (transaction.payment_status !== 'failed' ? transaction.cost : 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {totalPages > 1 && (
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BillingHistory;

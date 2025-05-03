'use client';

import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTransactionIcon, getStatusStyle } from './billingUtils';

const TransactionTableRow = ({ transaction }) => {

  return (
    <TableRow key={transaction.id} className="border-b border-subtle-border">
      <TableCell className="py-4 text-white">
        {format(parseISO(transaction.created_time), 'MMM dd, yyyy')}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center mr-3">
          {getTransactionIcon(transaction.plan_type === 'buy_number' ? transaction.plan_type :transaction.payment_decsription.reason)}

          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white">{transaction.payment_decsription.title || "Not Provided"}</span>
              { transaction.payment_decsription.reason==='subscription_cycle' && (
                <RefreshCw className="w-3 h-3 text-accent-teal" />
              )}
            </div>
            {transaction.payment_description?.title==='subscription_cycle' && (
              <div className="text-xs text-gray-400">Monthly recurring</div>
            )}
            {transaction.payment_status==='failed' && (
              <div className="flex items-center text-xs text-sentiment-negative mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
               {transaction.payment_decsription.reason ?transaction.payment_decsription.reason:'Payment Failed'}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell className="text-white">
       ₹ {transaction.cost.toFixed(2)}
      </TableCell>

      <TableCell className="text-gray-300">

      <TableCell className="text-gray-300">
  {transaction?.payment_method?.name ? (
    <>
      {transaction.payment_method.name}
      <span className="mx-1">. . . .</span>
      {transaction.payment_method.number}
    </>
  ) : (
    <span className="text-gray-500 italic">Not Provided</span>
  )}
</TableCell>

      </TableCell>

      <TableCell>
      <a
  href={transaction.invoice_url}
  download
  target="_blank"
  rel="noopener noreferrer"
>
          <a
   href={transaction.invoice_url}
   download
 
   rel="noopener noreferrer"
 >
   <Button variant="ghost" size="sm" className="h-8 px-2 text-accent-teal">
     <Download className="w-4 h-4 mr-1" /> PDF
   </Button>
 </a>
</a>

      </TableCell>

      <TableCell className="text-right">
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(transaction.payment_status  )}`}>
          {transaction.payment_status}
        </span>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTableRow;

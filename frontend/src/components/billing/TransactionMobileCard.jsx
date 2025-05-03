import React from 'react';
import { format, parseISO } from 'date-fns';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTransactionIcon, getStatusStyle } from './billingUtils';

const TransactionMobileCard = ({ transaction }) => {
  return (
    <div className="glass-panel rounded-lg p-4 border-l-2 border-subtle-border overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center mr-3">
          {getTransactionIcon(transaction.plan_type === 'buy_number' ? transaction.plan_type :transaction?.payment_decsription.reason)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium truncate max-w-[200px] block">
                {transaction.payment_decsription.title}
              </span>
              { transaction.payment_decsription.reason==='subscription_cycle' && (
                            <RefreshCw className="w-3 h-3 text-accent-teal" />
                          )}
            </div>
            <div className="text-xs text-gray-400">
              {format(parseISO(transaction.created_time), 'MMM dd, yyyy')}
              {transaction.payment_description?.title==='subscription_cycle' && (
              <div className="text-xs text-gray-400">Monthly recurring</div>
            )}
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(transaction.payment_status)}`}>
          {transaction.payment_status}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm mt-3 pt-2 border-t border-subtle-border">
        <div className="text-gray-400">
          <div className="text-xs">Payment Method: {transaction.payment_method.name || 'Not Provided'}</div>
          {transaction.payment_status === 'failed' && transaction.payment_decsription.reason && (
            <div className="flex items-center text-xs text-sentiment-negative mt-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              {transaction.payment_decsription.reason}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-white font-medium">
            ₹{transaction.cost.toFixed(2)}
          </div>
          <a
  href={transaction.invoice_url}
  download

  rel="noopener noreferrer"
>
  <Button variant="ghost" size="sm" className="h-8 px-2 text-accent-teal">
    <Download className="w-4 h-4 mr-1" /> PDF
  </Button>
</a>

        </div>
      </div>
    </div>
  );
};

export default TransactionMobileCard;

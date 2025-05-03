import { Phone, ArrowUp, FileText, DollarSign, CreditCard, RefreshCw } from 'lucide-react';

export const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'bg-sentiment-positive/20 text-sentiment-positive';
    case 'failed':
    case 'overdue':
      return 'bg-sentiment-negative/20 text-sentiment-negative';
    case 'pending':
      return 'bg-sentiment-neutral/20 text-sentiment-neutral';
    default:
      return 'bg-sentiment-positive/20 text-sentiment-positive';
  }
};

export const getTransactionIcon = (type) => {
  switch (type) {
    case 'buy_number':
      return <Phone className="w-5 h-5 text-accent-teal" />;
    case 'usage':
      return <ArrowUp className="w-5 h-5 text-accent-purple" />;
    case 'subscription_cycle':
      return <DollarSign className="w-5 h-5 text-accent-purple" />;
    case 'service':
      return <FileText className="w-5 h-5 text-accent-blue" />;
    case 'subscription_create':
      return <RefreshCw className="w-5 h-5 text-accent-green" />;
    default:
      return <CreditCard className="w-5 h-5 text-accent-teal" />;
  }
};

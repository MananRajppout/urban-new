import { ReactNode } from 'react';
import StatCard from '@/components/admin/StatCard';
import StatCardTooltip from './StatCardTooltip';
import { Phone, Clock, UserPlus, DollarSign, BarChart3, Users, Zap, Activity } from 'lucide-react';

function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';

  const rounded = Math.round(value * 100) / 100; // round to 2 decimal places
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}


export default function StatCardsGrid({dashboardStats}) {
  const statCards = [
    {
      title: 'Total Call Volume',
      value: formatNumber(dashboardStats?.data?.totalCalls),
      icon: <Phone size={24} />,
      trend: { value: 12.5, isPositive: true },
      accentColor: 'blue-accent',
      tooltip:
        'The sum of all calls made through the platform (inbound and outbound). Updated hourly and reflects calls across all customers.',
    },
    {
      title: 'Total Minutes Used',
      value: formatNumber(dashboardStats?.data?.totalDuration),
      icon: <Clock size={24} />,
      trend: { value: 8.3, isPositive: true },
      accentColor: 'green-accent',
      tooltip:
        'The total duration of all calls in minutes. This metric is calculated by summing the duration of all completed calls. It is a key billing metric as customers are charged based on minutes used.',
    },
    {
      title: 'Total Signups',
      value: formatNumber(dashboardStats?.data?.totalSignUps),
      icon: <UserPlus size={24} />,
      trend: { value: 5.2, isPositive: true },
      accentColor: 'yellow-accent',
      tooltip:
        "Total number of user registrations. Includes all accounts whether they've converted to paid plans or not. Calculated as a cumulative count of all registered users regardless of their current status.",
    },
    {
      title: 'Paid Customers',
      value: formatNumber(dashboardStats?.data?.paidCustomers),
      icon: <DollarSign size={24} />,
      trend: { value: 7.8, isPositive: true },
      accentColor: 'blue-accent',
      tooltip:
        'Number of customers on paid plans (Basic, Professional, Enterprise). Calculated by counting all customers with an active paid subscription. This is a key revenue metric that directly correlates with monthly recurring revenue.',
    },
    {
      title: 'Avg. Call Duration',
      value: formatNumber(dashboardStats?.data?.averageDuration) + " mins",
      icon: <BarChart3 size={24} />,
      trend: { value: 2.1, isPositive: false },
      accentColor: 'green-accent',
      tooltip:
        'Average length of calls in minutes. Calculated as (Total Minutes / Total Calls). This metric helps track user engagement and conversation quality. Longer calls often indicate more complex or valuable conversations.',
    },
    {
      title: 'Active Accounts',
      value: formatNumber(dashboardStats?.data?.activeAccounts),
      icon: <Users size={24} />,
      trend: { value: 4.3, isPositive: true },
      accentColor: 'purple-accent',
      tooltip:
        'Accounts that have made at least one call in the last 30 days OR have made any payment in the last 30 days. This metric tracks both usage engagement and recent paying customers.',
    },
    {
      title: 'Total Inbound Calls',
      value: formatNumber(dashboardStats?.data?.inboundCalls),
      icon: <Phone size={24} />,
      trend: { value: 14.2, isPositive: true },
      accentColor: 'green-accent',
      tooltip:
        'Total number of calls received by your system. Calculated by counting all calls initiated by external users to your phone numbers. Important for tracking customer engagement.',
    },
    {
      title: 'Total Outbound Calls',
      value: formatNumber(dashboardStats?.data?.outboundCalls),
      icon: <Phone size={24} />,
      trend: { value: 9.7, isPositive: true },
      accentColor: 'blue-accent',
      tooltip:
        'Total number of calls initiated by your system. Calculated by counting all calls your system made to external phone numbers. Useful for tracking outbound campaigns and follow-ups.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <div className="relative" key={index}>
          <StatCard
            title={<StatCardTooltip title={card.title} content={card.tooltip} />}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            accentColor={card.accentColor}
          />
        </div>
      ))}
    </div>
  );
}

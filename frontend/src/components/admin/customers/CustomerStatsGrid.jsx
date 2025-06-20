import { ReactNode } from 'react';
import StatCard from '@/components/admin/StatCard';
import StatCardTooltip from '../dashboard/StatCardTooltip';
import { Phone, Clock, UserPlus, DollarSign, BarChart3, Users, Zap, Activity } from 'lucide-react';

function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';

  const rounded = Math.round(value * 100) / 100; // round to 2 decimal places
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}


export default function CustomerStatCardsGrid({dashboardStats}) {
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
      title: 'Total Call Ducation',
      value: formatNumber(dashboardStats?.data?.totalDuration),
      icon: <Clock size={24} />,
      trend: { value: 8.3, isPositive: true },
      accentColor: 'green-accent',
      tooltip:
        'The total duration of all calls in minutes. This metric is calculated by summing the duration of all completed calls. It is a key billing metric as customers are charged based on minutes used.',
    },
    {
      title: 'Total Minutes Used',
      value: formatNumber(dashboardStats?.data?.voiceMinutes?.used),
      icon: <Clock size={24} />,
      trend: { value: 8.3, isPositive: true },
      accentColor: 'green-accent',
      tooltip:
        'The total duration of all calls in minutes. This metric is calculated by summing the duration of all completed calls. It is a key billing metric as customers are charged based on minutes used.',
    },
    {
      title: 'Remaining Minutes',
      value: formatNumber(dashboardStats?.data?.voiceMinutes?.remaining),
      icon: <Clock size={24} />,
      trend: { value: 8.3, isPositive: true },
      accentColor: 'green-accent',
      tooltip:
        'The total duration of all calls in minutes. This metric is calculated by summing the duration of all completed calls. It is a key billing metric as customers are charged based on minutes used.',
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
    {
      title: 'Total Phone Number',
      value: formatNumber(dashboardStats?.data?.phoneNumbers?.length),
      icon: <Phone size={24} />,
      trend: { value: 9.7, isPositive: true },
      accentColor: 'blue-accent',
      tooltip:
        'Total number of calls initiated by your system. Calculated by counting all calls your system made to external phone numbers. Useful for tracking outbound campaigns and follow-ups.',
    }
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

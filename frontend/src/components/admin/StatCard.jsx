import { ReactNode } from 'react';
import { cn } from '@/lib/utils';



export default function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  accentColor = 'blue-accent',
}) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="max-w-[75%]">
          <div className="stat-label">{title}</div>
          <p
            className={cn(
              'stat-value text-base sm:text-xl md:text-2xl lg:text-3xl',
              `text-${accentColor}`
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn('rounded-full p-2', `bg-${accentColor} bg-opacity-20 text-${accentColor}`)}
        >
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center md:mt-4">
          <span
            className={cn(
              'text-xs sm:text-sm',
              trend.isPositive ? 'text-green-accent' : 'text-red-accent'
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          <span className="ml-2 text-xs text-gray-400">vs. previous period</span>
        </div>
      )}
    </div>
  );
}

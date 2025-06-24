import {
    subDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    subMonths,
} from 'date-fns';


export const dateRangeOptions = [
    {
      label: 'Today',
      value: 'today',
      // getRange: () => {
      //   const today = new Date();
      //   return [today, today];
      // },
      getRange: () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
      
        const end = new Date();
        end.setHours(23, 59, 59, 999);
      
        return [start, end];
      }
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      getRange: () => {
        const yesterday = subDays(new Date(), 1);
        const start = new Date(yesterday);
        start.setHours(0, 0, 0, 0);
      
        const end = new Date(yesterday);
        end.setHours(23, 59, 59, 999);
        return [start, end];
      },
    },
    {
      label: 'This Week',
      value: 'this-week',
      getRange: () => {
        const now = new Date();
        return [startOfWeek(now), endOfWeek(now)];
      },
    },
    {
      label: 'Last Week',
      value: 'last-week',
      getRange: () => {
        const now = subDays(new Date(), 7);
        return [startOfWeek(now), endOfWeek(now)];
      },
    },
    {
      label: 'This Month',
      value: 'this-month',
      getRange: () => {
        const now = new Date();
        return [startOfMonth(now), endOfMonth(now)];
      },
    },
    {
      label: 'Last Month',
      value: 'last-month',
      getRange: () => {
        const lastMonth = subMonths(new Date(), 1);
        return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
      },
    },
    {
      label: 'All Time',
      value: 'all-time',
      getRange: () => {
        return [new Date(2020, 0, 1), new Date()];
      },
    },
    {
      label: 'Custom',
      value: 'custom',
      getRange: () => [new Date(), new Date()],
    },
  ];
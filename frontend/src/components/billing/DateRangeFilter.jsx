

import { useState } from 'react';
import { Button } from '@/components/ui/button';


import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover,PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, FilterIcon } from 'lucide-react';


const DateRangeFilter = ({ dateRange, setDateRange, filterOpen, setFilterOpen }) => {
  const handleSelect = (range) => {
    if (range) {
      setDateRange(range);
    }
  };

  const formatDateDisplay = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
      }
      return format(dateRange.from, 'MMM d, yyyy');
    }
    return 'Select date range';
  };

  return (
    <Popover open={filterOpen} onOpenChange={setFilterOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-glass-panel-light/30 text-white hover:bg-glass-panel-light/40 w-full sm:w-auto">
          <FilterIcon className="w-4 h-4 mr-2" />
          <CalendarIcon className="w-4 h-4 mr-2" />
          {formatDateDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-glass-panel border-subtle-border" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          className="text-white pointer-events-auto"
        />
        <div className="p-3 border-t border-subtle-border">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">{formatDateDisplay()}</div>
            <Button
              size="sm"
              className="bg-accent-teal text-black"
              onClick={() => setFilterOpen(false)}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;

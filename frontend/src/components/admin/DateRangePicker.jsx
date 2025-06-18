import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  format
} from 'date-fns';
import { dateRangeOptions } from '@/data/dateRangeOption';





export default function DateRangePicker({ onRangeChange }) {
  const [dateRange, setDateRange] = useState(dateRangeOptions[4].getRange());
  const [selectedOption, setSelectedOption] = useState(dateRangeOptions[4].value);
  const [date, setDate] = useState(new Date());

  const handleSelectChange = (value) => {
    const option = dateRangeOptions.find(o => o.value === value);

    if (option) {
      setSelectedOption(value);
      if (value !== 'custom') {
        const newRange = option.getRange();
        setDateRange(newRange);
        onRangeChange(newRange);
      }
    }
  };

  const formatDateRange = (range) => {
    if (range[0].toDateString() === range[1].toDateString()) {
      return format(range[0], 'MMM d, yyyy');
    }
    return `${format(range[0], 'MMM d, yyyy')} - ${format(range[1], 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedOption} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[180px] border-dark-100 bg-dark-200 text-white border-none">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent className="border-dark-100 bg-dark-200 text-white">
          {dateRangeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOption === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start border-dark-100 bg-dark-200 text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange ? formatDateRange(dateRange) : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-dark-100 bg-dark-200 p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange[0]}
              selected={{ from: dateRange[0], to: dateRange[1] }}
              onSelect={range => {
                if (range?.from && range?.to) {
                  const newRange = [range.from, range.to];
                  setDateRange(newRange);
                  onRangeChange(newRange);
                }
              }}
              numberOfMonths={2}
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>
      )}

      {selectedOption !== 'custom' && (
        <Button variant="outline" className="border-dark-100 bg-dark-200 text-white border-none">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(dateRange)}
        </Button>
      )}
    </div>
  );
}

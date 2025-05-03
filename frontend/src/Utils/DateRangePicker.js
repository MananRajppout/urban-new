import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DateRangePicker() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateChange = (date) => {
    if (!startDate) {
      setStartDate(date);
    } else if (!endDate && date > startDate) {
      setEndDate(date);
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };

  return (
    <div>
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsStart
        inline
        placeholderText="Select a date range"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}

export default DateRangePicker
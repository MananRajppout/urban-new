import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker.css";
import "react-calendar/dist/Calendar.css";
import "@/styles/Widget/date-range-picker.css";

export default function DateRangePicker({ filter, setFilter }) {
  return (
    <div className="date-range-picker">
      <DateTimeRangePicker
        format="yyy-MM-dd"
        disableClock={true}
        calendarIcon={null}
        clearIcon={null}
        onChange={setFilter}
        value={filter}
      />
    </div>
  );
}

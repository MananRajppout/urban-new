import "@/styles/CreateChatbot/stats.css";
import { useRouter } from "next/router";
import { useChartData } from "@/hooks/stats";
import { ChartBox } from "./ChartBox";
import { useState, useMemo } from "react";
import { getTimeRange } from "@/Utils";
import Dropdown from "@/components/Widget/Dropdown";
import DateRangePicker from "@/components/Widget/DateRangePicker";
import { filters } from "@/lib/utils";
import Counts from "./Counts";

export default function Stats() {
  const router = useRouter();
  const { id } = router.query;
  const [customDates, setCustomDates] = useState(
    Object.values(getTimeRange("1month"))
  );

  const [activeItem, setActiveItem] = useState("all");
  const range = useMemo(() => {
    if (activeItem === "custom") {
      return {
        from: customDates[0],
        to: customDates[1],
      };
    }
    return { from: "", to: "" };
  }, [activeItem, customDates]);
  const period = activeItem;

  const { sessionData, chatData } = useChartData({ id, range, period });

  return (
    <div className="stats">
      <div className="header">
        <Counts id={id} range={range} period={period} />
        <div className="filter">
          <Dropdown
            placeholder={"Filter"}
            items={filters}
            currentValue={activeItem}
            onSelect={setActiveItem}
          />
          {activeItem === "custom" && (
            <DateRangePicker filter={customDates} setFilter={setCustomDates} />
          )}
        </div>
      </div>
      <ChartBox title="Number of users" data={sessionData} yLabel="User" />
      <ChartBox title="Number of chats" data={chatData} yLabel="Chats" />
    </div>
  );
}

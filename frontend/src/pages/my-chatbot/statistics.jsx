import { useChartData } from "@/hooks/stats";
import { getTimeRange } from "@/Utils";
import { useMemo, useState } from "react";
import Counts from "@/components/CreateChatbot/Stats/Counts";
import Dropdown from "@/components/Widget/Dropdown";
import DateRangePicker from "@/components/Widget/DateRangePicker";
import { ChartBox } from "@/components/CreateChatbot/Stats/ChartBox";
import { filters } from "@/lib/utils";
import "@/styles/MyChatbot/statistics.css";
import Skeleton from "@/components/Widget/Skeleton";
export default function Statistics() {
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

  const { sessionData, chatData, chatBoxData, leadData, isLoading } =
    useChartData({
      range,
      period,
    });
  return (
    <div className="mx-12">
      <h1>Statistics</h1>
      <div className="my-8 flex flex-col gap-4">
        <div className="flex justify-between ">
          <Counts range={range} period={period} showModelCount />
          <div className="flex flex-col items-end">
            <Dropdown
              placeholder={"Filter"}
              items={filters}
              currentValue={activeItem}
              onSelect={setActiveItem}
            />
            {activeItem === "custom" && (
              <DateRangePicker
                filter={customDates}
                setFilter={setCustomDates}
              />
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {isLoading && <Skeleton height={400} className="!w-auto m-0" />}
          {isLoading && <Skeleton height={400} className="!w-auto m-0" />}
          {isLoading && <Skeleton height={400} className="!w-auto m-0" />}
          {!isLoading && (
            <>
              <ChartBox
                title="Number of users"
                data={sessionData}
                yLabel="User"
              />
              <ChartBox
                title="Number of chats"
                data={chatData}
                yLabel="Chats"
              />
              <ChartBox
                title="Number of chatbox"
                data={chatBoxData}
                yLabel="ChatBox"
              />
              <ChartBox
                title="Number of leads"
                data={leadData}
                yLabel="Leads"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

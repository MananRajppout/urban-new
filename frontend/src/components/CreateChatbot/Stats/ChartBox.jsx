import { useChartData } from "@/hooks/stats";
import ApexChartWrapper from "./ApexChartWrapper";
import "@/styles/CreateChatbot/stats.css";
export function ChartBox({ xLabel, title, data, yLabel }) {
  const options = {
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM dd",
          day: "MMM dd",
          hour: "hh:mm TT",
        },
      },
      title: {
        text: xLabel || "Time",
      },
    },
    yaxis: {
      title: {
        text: yLabel || "Data",
      },
    },
  };

  return (
    <div className="flex flex-col gap-3 bg-gray-800">
      <div className="flex justify-between px-6 my-6">
        <div className="font-medium text-lg">{title}</div>
      </div>
      <ApexChartWrapper options={options} series={data} />
    </div>
  );
}

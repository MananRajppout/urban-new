"use client";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

import "@/styles/CreateChatbot/stats.css";

export default function ApexChartWrapper({
  options,
  type = "area",
  height = 300,
  series,
}) {
  const _options = {
    chart: {
      toolbar: false,
      zoom: false,
      parentHeightOffset: 0,
      stroke: {
        curve: "smooth",
        lineCap: "round",
      },
      foreColor: "#637381",
    },
    grid: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const time = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const formatOptions = {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        };
        const timeString = new Intl.DateTimeFormat(
          "en-US",
          formatOptions
        ).format(time);
        return `
        <div class="chart-area-tooltip">
          <div>${options.yaxis.title.text}: ${series[seriesIndex][dataPointIndex]}</div>
          <div>Time: ${timeString}</div>
        </div>
        `;
      },
    },
    legend: {
      show: false,
    },
    ...options,
  };

  return (
    <ApexChart type={type} height={height} options={_options} series={series} />
  );
}

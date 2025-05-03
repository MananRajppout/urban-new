import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/Popover/Popover";
import { Button } from "@/components/ui/button";

const ActivityChart = ({ data = [], period, setPeriod }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
  
    return (
      <div className="glass-panel p-3 backdrop-blur-lg rounded-md">
        <p className="text-sm text-gray-300 font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-semibold"
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  };
  

  return (
    <div className="glass-panel p-6 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">Call Activity</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Info className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent className="max-w-[250px] bg-glass-panel-light backdrop-blur-lg text-xs !p-3 border-subtle-border">
              Visualizes call volume over time. The chart displays call patterns
              by hour (daily view), by day (weekly view), or by week (monthly
              view). This helps identify peak calling periods and trends in user
              engagement.
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            style={{
              border: "1px solid #27272a",
              cursor: "pointer",
            }}
            variant={period === "daily" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPeriod("daily")}
          >
            Daily
          </Button>
          <Button
            style={{
              border: "1px solid #27272a",
              cursor: "pointer",
            }}
            variant={period === "weekly" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </Button>
          <Button
            style={{
              border: "1px solid #27272a",
              cursor: "pointer",
            }}
            variant={period === "monthly" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            style={{
              border: "1px solid #27272a",
              cursor: "pointer",
            }}
            variant={period === "total" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPeriod("total")}
          >
            Total
          </Button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#48e2b3" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#48e2b3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPhone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffa07a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffa07a" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#999" }}
              axisLine={{ stroke: "#444" }}
              tickLine={{ stroke: "#444" }}
              height={40}
              tickMargin={10}
              angle={0}
              textAnchor="middle"
              fontSize={11}
            />
            <YAxis
              tick={{ fill: "#999" }}
              axisLine={{ stroke: "#444" }}
              tickLine={{ stroke: "#444" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="web"
              stroke="#48e2b3"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorWeb)"
              name="Web Calls"
            />
            <Area
              type="monotone"
              dataKey="phone"
              stroke="#ffa07a"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPhone)"
              name="Phone Calls"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;

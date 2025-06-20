'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#00C49F', '#FF5D73', '#8884d8', '#FFBB28', '#7E57C2', '#1DE9B6'];

export default function UserChartsSection({ chartData }) {
  if (!chartData) return null;

  const { callStats, callTypeBreakdown, phoneStatus } = chartData;

  const barData = callStats.labels.map((label, index) => ({
    name: label,
    value: callStats.values[index]
  }));

  const callTypeData = callTypeBreakdown.labels.map((label, index) => ({
    name: label,
    value: callTypeBreakdown.values[index]
  }));

  const phoneStatusData = phoneStatus.labels.map((label, index) => ({
    name: label,
    value: phoneStatus.values[index]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Bar Chart - Call Stats */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2 text-lg">Call & Minute Stats</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Call Type */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2 text-lg">Call Type Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={callTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {callTypeData.map((_, index) => (
                <Cell key={`ct-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Phone Number Status */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2 text-lg">Phone Number Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={phoneStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {phoneStatusData.map((_, index) => (
                <Cell key={`ps-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

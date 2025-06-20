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
  Legend,
} from 'recharts';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#FF5D73', '#7E57C2'];

export default function ChartsSection({ chartData }) {
  if (!chartData) return null;

  const {
    callsBreakdown,
    userConversion,
    generalStats,
  } = chartData;

  const pieCallsData = callsBreakdown.labels.map((label, i) => ({
    name: label,
    value: callsBreakdown.values[i],
  }));

  const pieUsersData = userConversion.labels.map((label, i) => ({
    name: label,
    value: userConversion.values[i],
  }));

  const barGeneralData = generalStats.labels.map((label, i) => ({
    name: label,
    value: generalStats.values[i],
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Pie Chart - Calls */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Calls Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieCallsData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {pieCallsData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Users */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">User Conversion</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieUsersData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#82ca9d"
              label
            >
              {pieUsersData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - General Stats */}
      <div className="glass-panel p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Overall Metrics</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barGeneralData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

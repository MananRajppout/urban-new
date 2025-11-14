import React from "react";
import { User } from "lucide-react";

const CallTable = ({
  calls,
  formatDate,
  getSentimentBadge,
  getStatusBadge,
  onRowClick,
}) => {
  console.log(calls);
  const handleRowClick = (call) => {
    if (onRowClick) {
      onRowClick(call);
    }
  };

  const tableBorderStyle = {
    borderCollapse: "collapse",
  };

  const headerRowStyle = {
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  };

  const rowBorderStyle = {
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={tableBorderStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Caller ID
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Agent
              </th>
              <th className="hidden md:table-cell py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="hidden md:table-cell py-3 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Label
              </th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, index) => (
              <tr
                key={call.id}
                style={index < calls.length - 1 ? rowBorderStyle : {}}
                className="hover:bg-glass-panel-light/20 transition-colors cursor-pointer"
                onClick={() => handleRowClick(call)}
              >
                <td className="py-4 px-4 text-sm text-gray-400">
                  {formatDate(call.date)}
                </td>
                <td className="py-4 px-4 text-sm text-white">
                  {call.caller_id}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-accent-teal/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-accent-teal" />
                    </div>
                    <span className="ml-3 text-sm text-gray-300">
                      {call.agent}
                    </span>
                  </div>
                </td>
                <td className="hidden md:table-cell py-4 px-4 text-center text-sm text-gray-300">
                  {call.duration}
                </td>
                <td className="hidden md:table-cell py-4 px-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-sentiment-positive/20 text-sentiment-positive`}
                  >
                    {call.originalData.level || "No Label"}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      call.status
                    )}`}
                  >
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallTable;

import React, { useEffect, useState } from "react";

import { fetchLeadsHistory } from "../../../lib/api/ApiUpdateChatbot";
import toast from "react-hot-toast";
import { getDateAfter, getFormattedDate, getIsoTime } from "../../../Utils";
import { useRouter } from "next/router";
import DateRangePicker from "@/components/Widget/DateRangePicker";
import DownloadIcon from "@/components/icons/DownloadIcon";
import Dropdown from "@/components/Widget/Dropdown";
import { useRole } from "@/hooks/useRole";

const exportItems = [
  {
    name: "PDF",
    value: "pdf",
  },
  {
    name: "JSON",
    value: "json",
  },
];

export default function Leads() {
  const [page, setPage] = useState(1);
  const [isOver, setIsOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState([getDateAfter(-7), getDateAfter(1)]);
  /*
   {
      "_id": "66220ad1dd38d9d334f1f671",
      "chat_model_id": "1eb76579-feb0-4b1c-b143-a5ee8c7f24cd",
      "title": "",
      "name": "",
      "email": "niteshdev547@gmail.com",
      "phone_number": "",
      "chat_session_id": "",
      "created_time": "2024-04-19T06:10:25.464Z"
    },
  */

  const router = useRouter();
  const { id } = router.query;

  const { canExport } = useRole();

  function downloadJsonFile() {
    const jsonStr = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "leads-history.json";
    document.body.appendChild(link);

    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function loadLeads(startTime, endTime) {
    if (isOver || isLoading) return;
    setIsLoading(true);

    const res = await fetchLeadsHistory(id, startTime, endTime);
    if (res.data) {
      setResults(res.data.leads);
    } else {
      toast.error(res.message);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadLeads(getFormattedDate(filter[0]), getFormattedDate(filter[1]));
  }, [filter]);

  function onExport(value) {
    if (value == "json") {
      downloadJsonFile();
    } else {
      toast.error("PDF export not implemented yet.");
    }
  }

  return (
    <div>
      <div>
        <h2>Leads</h2>

        <div style={{ alignItems: "end" }}>
          <div className="leads-header">
            <div>
              <div>
                <p className="input-title">Filter</p>
                <DateRangePicker filter={filter} setFilter={setFilter} />
              </div>
            </div>
            <div>
              {canExport && (
                <Dropdown
                  items={exportItems}
                  icon={<DownloadIcon />}
                  primary={true}
                  text="Export"
                  onSelect={onExport}
                />
              )}
            </div>
          </div>
        </div>

        <br />
        <br />
        <br />
        <h2>History</h2>
        {results.length === 0 ? (
          <p className="no-his-msg">No leads found</p>
        ) : (
          <div className="chat-area">
            <div className="leads-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created at</th>
                  </tr>
                </thead>
                {results.map((lead, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone_number}</td>
                    <td>{new Date(lead.created_time).toUTCString()}</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

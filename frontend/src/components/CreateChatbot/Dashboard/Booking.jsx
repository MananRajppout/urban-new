import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { getDateAfter, getFormattedDate, getIsoTime } from "../../../Utils";
import { useRouter } from "next/router";
import DateRangePicker from "@/components/Widget/DateRangePicker";
import { fetchBookingHistory } from "@/lib/api/ApiExtra";

export default function Booking() {
  const [page, setPage] = useState(1);
  const [isOver, setIsOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState([getDateAfter(-7), getDateAfter(1)]);
  /*
    {
      "_id": "6656e0a2e70679b6bcf37d62",
      "full_name": "nitesh",
      "email": "niteshdev547@gmail.com",
      "start_time": "2024-05-30T14:30:00.000Z",
      "event_type_uuid": "71cb34ea-6a28-4cf9-b3cd-800af573b037",
      "chatbot_id": "baeaba26-7018-4f00-80f7-edb57489e698",
    }
  */

  const router = useRouter();
  const { id } = router.query;

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

    const res = await fetchBookingHistory(id, startTime, endTime);
    if (res.data) {
      setResults(res.data.data);
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
        <h2>Booking</h2>

        <div style={{ alignItems: "end" }}>
          <div className="leads-header">
            <div>
              <div>
                <p className="input-title">Filter</p>
                <DateRangePicker filter={filter} setFilter={setFilter} />
              </div>
            </div>
          </div>
        </div>

        <br />
        <br />
        <br />
        <h2>History</h2>
        {results.length === 0 ? (
          <p className="no-his-msg">No booking found</p>
        ) : (
          <div className="chat-area">
            <div className="leads-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Meeting at</th>
                  </tr>
                </thead>
                {results.map((book, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{book.full_name}</td>
                    <td>{book.email}</td>
                    <td>{new Date(book.start_time).toUTCString()}</td>
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

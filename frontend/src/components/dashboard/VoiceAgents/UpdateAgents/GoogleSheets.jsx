import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2, AlertCircle, Calendar, Clock, X, CheckCircle, XCircle, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GoogleSheets = ({ agent }) => {
  // console.log('agentData',agentData)
  const agentId = agent._id;
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [header, setHeader] = useState(null);

  const [selectedMapping, setSelectedMapping] = useState({
    name: "",
    phone: "",
    context: "",
    summary: "",
    call_status: "",
  });

  // Timer/Schedule state
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isCancelling, setIsCancelling] = useState({});

  //   const agentId = "67e0517a7bfa14d48bcf43cd"; // Static agent ID
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Fetch sheet configuration when component mounts or agentId changes
  useEffect(() => {
    const fetchSheetConfig = async () => {
      if (!agentId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/config?agent_id=${agentId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();

        if (data.success && data.config) {
          setSpreadsheetId(data.config.spreadsheet_id || "");
          setSheetName(data.config.sheet_name || "");
          setIsConfigured(true);
          setSelectedMapping({
            name: data.config.mapped.name,
            phone: data.config.mapped.phone,
            context: data.config.mapped.context,
            summary: data.config.mapped.summary,
            call_status: data.config.mapped.call_status,
          });
          setHeader(data.config.headers);
        } else {
          setSpreadsheetId("");
          setSheetName("");
          setIsConfigured(false);
        }
      } catch (error) {
        console.error("Error fetching sheet config:", error);
        toast.error("Failed to fetch sheet configuration. Please try again.");
        setSpreadsheetId("");
        setSheetName("");
        setIsConfigured(false);
      }
    };

    fetchSheetConfig();
    fetchScheduledTasks();
  }, [agentId, authToken]);

  // Fetch scheduled tasks
  const fetchScheduledTasks = async () => {
    if (!agentId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/scheduled?agent_id=${agentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.tasks) {
        setScheduledTasks(data.tasks);
      } else {
        setScheduledTasks([]);
      }
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
      setScheduledTasks([]);
    }
  };

  // Function to configure the spreadsheet
  const handleConfigure = async () => {
    if (!spreadsheetId || !sheetName) {
      toast.error("Please enter both Spreadsheet ID and Sheet Name");
      return;
    }

    setIsConfiguring(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/configure`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agentId,
            spreadsheet_id: spreadsheetId,
            sheet_name: sheetName,
            column_mappings: {
              "<phone number>": "phone number",
              "<customer name>": "customer name",
              "<context>": "context",
              "<summary>": "summary",
            },
            mapped: selectedMapping,
          }),
        }
      );
      const data = await response.json();
      setApiResponse(data);
      if (data.success) {
        setIsConfigured(true);
        toast.success("Sheet configured successfully!");
      } else {
        toast.error(data.message || "Failed to configure sheet");
      }
    } catch (error) {
      console.log("error", error.message);
      toast.error("An error occurred while configuring the sheet");
    } finally {
      setIsConfiguring(false);
    }
  };

  // Function to start the process
  const handleStart = async () => {
    try {
      setIsStarted(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agent_id: agentId }),
        }
      );
      const data = await response.json();
      setApiResponse(data);
      if (data.success) {
        toast.success("Calls started successfully!");
      } else {
        toast.error(data.message || "Failed to start calls");
      }
    } catch (error) {
      console.log("Error", error.message);
      toast.error("An error occurred while starting calls");
    } finally {
      setIsStarted(false);
    }
  };

  // Function to stop the process
  const handleStop = async () => {
    try {
      setIsStopped(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/stop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agent_id: agentId }),
        }
      );
      const data = await response.json();
      setApiResponse(data);
      if (data.success) {
        toast.success("Calls stopped successfully!");
      } else {
        toast.error(data.message || "Failed to stop calls");
      }
    } catch (error) {
      console.log("Error", error.message);
      toast.error("An error occurred while stopping calls");
    } finally {
      setIsStopped(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agent_id: agentId }),
        }
      );
      const data = await response.json();
      setApiResponse(data);
      if (data.success) {
        toast.success("Sheet reset successfully!");
      } else {
        toast.error(data.message || "Failed to reset sheet");
      }
    } catch (error) {
      console.log("Error", error.message);
      toast.error("An error occurred while resetting the sheet");
    } finally {
      setIsResetting(false);
    }
  };

  const getHeader = async () => {
    try {
      if (!sheetName || !spreadsheetId) return;
      const formData = {
        spreadsheet_id: spreadsheetId,
        sheet_name: sheetName,
      }



      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/header`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ agent_id: agentId, ...formData }),
        }
      );
      const data = await response.json();
      setApiResponse(data);
      if (data.success) {
        toast.success("Sheet reset successfully!");
      } else {
        toast.error(data.message || "Failed to reset sheet");
      }
      setHeader(data.headers);
    } catch (error) {
      toast.error("Failed to fetch sheet header. Please try again.");
      console.error("Error fetching sheet header:", error);
    }
  }

  // Function to schedule calls
  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select both date and time");
      return;
    }

    if (!isConfigured) {
      toast.error("Please configure the sheet first");
      return;
    }

    try {
      setIsScheduling(true);
      const dateTimeString = `${scheduleDate}T${scheduleTime}`;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/schedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agentId,
            time: dateTimeString,
            timezone: timezone,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success("Calls scheduled successfully!");
        setScheduleDate("");
        setScheduleTime("");
        fetchScheduledTasks(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to schedule calls");
      }
    } catch (error) {
      console.error("Error scheduling calls:", error);
      toast.error("An error occurred while scheduling calls");
    } finally {
      setIsScheduling(false);
    }
  };

  // Function to cancel scheduled calls
  const handleCancelSchedule = async (taskId) => {
    try {
      setIsCancelling({ ...isCancelling, [taskId]: true });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sheet/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task_id: taskId }),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success("Scheduled calls cancelled successfully!");
        fetchScheduledTasks(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to cancel scheduled calls");
      }
    } catch (error) {
      console.error("Error cancelling scheduled calls:", error);
      toast.error("An error occurred while cancelling scheduled calls");
    } finally {
      setIsCancelling({ ...isCancelling, [taskId]: false });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-900/30 border-yellow-700 text-yellow-400', icon: Clock },
      completed: { color: 'bg-green-900/30 border-green-700 text-green-400', icon: CheckCircle },
      failed: { color: 'bg-red-900/30 border-red-700 text-red-400', icon: XCircle },
      processing: { color: 'bg-blue-900/30 border-blue-700 text-blue-400', icon: Loader }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-medium text-white mb-2">
        Google Sheet Integration
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Connect a Google Sheet for bulk outbound calls. The sheet should contain
        phone numbers, name, context, Status, Summary and relevant call data.
      </p>

      {/* Service Account Access Alert */}
      <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-base font-medium text-amber-400 mb-1">
              Important: Grant Sheet Access
            </h3>
            <p className="text-sm text-gray-300">
              Before configuring your sheet, you must grant access to our
              service account:{" "}
              <span className="font-mono text-amber-300">
                urbanchat@outbound-urbanchat.iam.gserviceaccount.com
              </span>
            </p>
            <p className="text-sm text-gray-300 mt-2">
              To grant access: Open your Google Sheet → Click "Share" → Add the
              email above with "Editor" access → Click "Share"
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Show Connected Sheet Info if configured */}
        {isConfigured && (
          <div className="mb-6 p-4 bg-gray-800 rounded-md">
            <h3 className="text-base font-medium text-white mb-2">
              Connected Sheet
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Spreadsheet ID:</span>
                <span className="text-white font-mono text-sm">
                  {spreadsheetId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sheet Name:</span>
                <span className="text-white">{sheetName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Configure Spreadsheet */}
        <div>
          <h3 className="text-base font-medium text-white mb-3">
            {isConfigured
              ? "Update Sheet Configuration"
              : "Configure Spreadsheet"}
          </h3>
          <label className="block text-sm text-gray-400 mb-1">
            Spreadsheet ID
          </label>
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="Enter Spreadsheet ID"
            className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
          />
          <label className="block text-sm text-gray-400 mb-1 mt-3">
            Sheet Name
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Enter Sheet Name"
            className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
          />

          {/* <Button onClick={getHeader} className="mt-4">Get Header</Button>
          <div className=" my-4">
            <h3 className="text-base font-medium text-white mb-3">Mapped Header</h3>
            {header && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Customer Name:</span>
                  <Select value={selectedMapping.name} onValueChange={(value) => setSelectedMapping({ ...selectedMapping, name: value })}>
                    <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal w-[300px]">
                      <SelectValue placeholder="Select a Language model" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border border-subtle-border">
                      {header?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Phone Number:</span>
                  <Select value={selectedMapping.phone} onValueChange={(value) => setSelectedMapping({ ...selectedMapping, phone: value })}>
                    <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal w-[300px]">
                      <SelectValue placeholder="Select a Language model" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border border-subtle-border">
                      {header?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Context:</span>
                  <Select value={selectedMapping.context} onValueChange={(value) => setSelectedMapping({ ...selectedMapping, context: value })}>
                    <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal w-[300px]">
                      <SelectValue placeholder="Select a Language model" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border border-subtle-border">
                      {header?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Summary:</span>
                  <Select value={selectedMapping.summary} onValueChange={(value) => setSelectedMapping({ ...selectedMapping, summary: value })}>
                    <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal w-[300px]">
                      <SelectValue placeholder="Select a Language model" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border border-subtle-border">
                      {header?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Status:</span>
                  <Select value={selectedMapping.call_status} onValueChange={(value) => setSelectedMapping({ ...selectedMapping, call_status: value })}>
                    <SelectTrigger className="glass-panel border border-subtle-border focus:ring-0 focus:ring-offset-0 focus:border-accent-teal w-[300px]">
                      <SelectValue placeholder="Select a Language model" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border border-subtle-border">
                      {header?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div> */}

          <Button
            variant="outline"
            className="mt-3 border-subtle-border text-gray-300 hover:text-white"
            onClick={handleConfigure}
            disabled={isConfiguring}
          >
            <Link2 className="w-4 h-4 mr-2" />
            {isConfiguring
              ? "Configuring..."
              : isConfigured
                ? "Update Configuration"
                : "Configure"}
          </Button>
        </div>

        {/* Only show these buttons if sheet is configured */}
        {isConfigured && (
          <>
            {/* Start API */}
            <div>
              <h3 className="text-base font-medium text-white mb-3">
                Start Calls
              </h3>
              <Button
                variant="outline"
                className="border-subtle-border text-gray-300 hover:text-white"
                onClick={handleStart}
                disabled={isStarted}
              >
                <Link2 className="w-4 h-4 mr-2" />
                {isStarted ? "Starting..." : "Start"}
              </Button>
            </div>

            {/* Stop API */}
            <div>
              <h3 className="text-base font-medium text-white mb-3">
                Stop Calls
              </h3>
              <Button
                variant="outline"
                className="border-subtle-border text-gray-300 hover:text-white"
                onClick={handleStop}
                disabled={isStopped}
              >
                <Link2 className="w-4 h-4 mr-2" />
                {isStopped ? "Stopping..." : "Stop"}
              </Button>
            </div>

            {/* Reset API */}
            <div>
              <h3 className="text-base font-medium text-white mb-3">
                Reset Sheet
              </h3>
              <Button
                variant="outline"
                className="border-subtle-border text-gray-300 hover:text-white"
                onClick={handleReset}
                disabled={isResetting}
              >
                <Link2 className="w-4 h-4 mr-2" />
                {isResetting ? "Resetting..." : "Reset"}
              </Button>
            </div>

            {/* Schedule Calls Section */}
            <div className="border-t border-subtle-border pt-6">
              <h3 className="text-base font-medium text-white mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Calls
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Schedule your sheet calls to run at a specific date and time
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    readOnly
                    className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-gray-400 bg-transparent cursor-not-allowed"
                  />
                </div>

                <Button
                  variant="outline"
                  className="border-subtle-border text-gray-300 hover:text-white"
                  onClick={handleSchedule}
                  disabled={isScheduling || !scheduleDate || !scheduleTime}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {isScheduling ? "Scheduling..." : "Schedule Calls"}
                </Button>
              </div>

              {/* Scheduled Tasks List */}
              {scheduledTasks.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Scheduled Tasks ({scheduledTasks.length})
                  </h4>
                  <div className="space-y-3">
                    {scheduledTasks.map((task) => (
                      <div
                        key={task._id}
                        className="glass-panel border border-subtle-border rounded-md p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusBadge(task.status)}
                              <span className="text-sm text-gray-300">
                                {formatDate(task.time)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Task ID: {task._id}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-700 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                            onClick={() => handleCancelSchedule(task._id)}
                            disabled={
                              task.status === "completed" ||
                              task.status === "failed" ||
                              isCancelling[task._id]
                            }
                          >
                            {isCancelling[task._id] ? (
                              <>
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleSheets;

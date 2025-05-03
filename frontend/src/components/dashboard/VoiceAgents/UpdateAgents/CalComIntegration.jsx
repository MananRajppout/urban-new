import React from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

const CalComIntegration = ({
  calApiKey,
  setCalApiKey,
  calEventId,
  setCalEventId,
  isCalConnected,
  handleConnectCal,
  name,
  setName,
  calTimeZone,
  setCalTimeZone,
  bookingName,
  setBookingName,
  bookingApiKey,
  setBookingApiKey,
  bookingTypeId,
  setBookingTypeId,
  bookingTimeZone,
  setBookingTimeZone,
  isBookingConnected,
  handleConnectBooking,
  isLoading,
}) => {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-medium text-white mb-4">
        Cal.com Integration
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Connect your agent to Cal.com for handling meeting scheduling during
        calls.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium text-white mb-3">
            Availability
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="availability"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Cal.com API Key
              </label>
              <input
                type="text"
                value={calApiKey}
                onChange={(e) => setCalApiKey(e.target.value)}
                placeholder="Enter Cal.com API key"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Event Type ID (Cal.com)
              </label>
              <input
                type="text"
                value={calEventId}
                onChange={(e) => setCalEventId(e.target.value)}
                placeholder="Enter Event ID"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={calTimeZone}
                onChange={(e) => setCalTimeZone(e.target.value)}
                placeholder="America/Los_Angeles"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              className={`border-subtle-border ${
                isCalConnected
                  ? "bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={handleConnectCal}
              disabled={isLoading}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {isLoading
                ? "Connecting..."
                : isCalConnected
                ? "Connected"
                : "Connect"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-white mb-3">Booking</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="booking"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Cal.com API Key
              </label>
              <input
                type="text"
                value={bookingApiKey}
                onChange={(e) => setBookingApiKey(e.target.value)}
                placeholder="Enter Cal.com API key"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Event Type ID (Cal.com)
              </label>
              <input
                type="text"
                value={bookingTypeId}
                onChange={(e) => setBookingTypeId(e.target.value)}
                placeholder="Enter Event ID"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={bookingTimeZone}
                onChange={(e) => setBookingTimeZone(e.target.value)}
                placeholder="Asia/Kolkata"
                className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-white bg-transparent focus:border-accent-teal focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              className={`border-subtle-border ${
                isBookingConnected
                  ? "bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={handleConnectBooking}
              disabled={isLoading}
            >
              <Link2 className="w-4 h-4 mr-2" />
              {isLoading
                ? "Connecting..."
                : isBookingConnected
                ? "Connected"
                : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalComIntegration;

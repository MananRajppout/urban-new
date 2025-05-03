import React from "react";
import CalComIntegration from "./CalComIntegration";
import GoogleSheets from "./GoogleSheets";

const IntegrationsSection = ({
  agent,
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
    <div className="space-y-6">
      {/* Cal.com Integration */}
      <CalComIntegration
        calApiKey={calApiKey}
        setCalApiKey={setCalApiKey}
        calEventId={calEventId}
        setCalEventId={setCalEventId}
        isCalConnected={isCalConnected}
        handleConnectCal={handleConnectCal}
        name={name}
        setName={setName}
        calTimeZone={calTimeZone}
        setCalTimeZone={setCalTimeZone}
        bookingName={bookingName}
        setBookingName={setBookingName}
        bookingApiKey={bookingApiKey}
        setBookingApiKey={setBookingApiKey}
        bookingTypeId={bookingTypeId}
        setBookingTypeId={setBookingTypeId}
        bookingTimeZone={bookingTimeZone}
        setBookingTimeZone={setBookingTimeZone}
        isBookingConnected={isBookingConnected}
        handleConnectBooking={handleConnectBooking}
        isLoading={isLoading}
      />
      <GoogleSheets agent={agent} />
    </div>
  );
};

export default IntegrationsSection;

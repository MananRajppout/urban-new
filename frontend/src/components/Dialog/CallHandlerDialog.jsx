import React, { useState } from "react";
import "../../styles/Dialog.css";

export default function CallHandlerDialog({ openDialog, setOpenPhoneDialog,handleOutboundCall }) {
  function onDialogClose() {
    setOpenPhoneDialog(false);
  }

  const [userPhoneNo, setUserPhoneNo] = useState('')

  const renderDialog = () => {
    switch (openDialog) {
      case "inbound":
        return (
          <div className="dialog-outer" onClick={(e) => e.target.className === "dialog-outer" && onDialogClose()}>
            <div className="dialog">
              <h2 className="center-title">Make an Inbound Call</h2>
              <p className="note">
                • Add this phone number to your business portal to allow customers to call any time. The system is configured to automatically answer calls 24/7.
              </p>
              <div className="page">
                <div className="flex-center flex-gap" style={{ margin: 0 }}>
                  <button onClick={onDialogClose} className="primary hover">
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "outbound":
        return (
          <div className="dialog-outer" onClick={(e) => e.target.className === "dialog-outer" && onDialogClose()}>
            <div className="dialog">
              <h2 className="center-title">Make an Outbound Call</h2>
              <p className="fade-text">Remember to prefix your number with the country code without space, e.g., +11234567890</p>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Enter your number (e.g., +919876543210)"
                  // value={phoneNumber}
                  onChange={(e) => setUserPhoneNo(e.target.value)}
                  className="text-field"
                />
              </div>
              <div className="page">
                <div className="flex-center flex-gap" style={{ margin: 0 }}>
                  <button className="outline" onClick={onDialogClose}>
                    Cancel
                  </button>
                  <button className="primary hover" onClick={()=>handleOutboundCall(userPhoneNo)}>
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderDialog()}</>;
}

import React, { useEffect, useRef, useState } from "react";

import "../../styles/Dialog.css";
import toast from "react-hot-toast";
import { deleteAccount, updateProfile } from "../../lib/api/ApiExtra";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LimitReachDialog({ isOpen, onDialogClose, message }) {
  const [isProcess, setIsProcess] = useState(false);

  const router = useRouter();

  function close(className) {
    if (isProcess) return;

    if (className == "dialog-outer") {
      onDialogClose();
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) => close(e.target.className)}
        >
          <div className="dialog mini">
            <h3 className="title">Limit Reached</h3>

            <p className="warning">{message}</p>

            <div className="col-2">
              <button
                onClick={() => close("dialog-outer")}
                className="hover outline"
              >
                Cancel
              </button>
              <Link href="/pricing">
                <button className="hover primary submit-btn">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

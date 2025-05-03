import React, { useEffect, useRef, useState } from "react";

import "../../styles/Dialog.css"
import toast from "react-hot-toast";
import { deleteAccount, updateProfile } from "../../lib/api/ApiExtra";
import { useRouter } from "next/router";



export default function DeleteDialog({ isOpen, onDialogClose }) {

  const [isProcess, setIsProcess] = useState(false)

  const router = useRouter()

  function close(className) {

    if (isProcess) return

    if (className == 'dialog-outer') {
      onDialogClose()
    }
  }


  async function onSubmit() {

    if (isProcess) return
    setIsProcess(true)

    const res = await deleteAccount()
    if (res.data) {
      localStorage.removeItem("access_token")
      toast.success("Account deleted successfully")
      onDialogClose()
      router.push("/")

    } else {
      toast.error(res.message)
    }

    setIsProcess(false)

  }


  return <>
    {isOpen && <div className="dialog-outer" onClick={(e) => close(e.target.className)}>
      <div className="dialog mini">
        <h3 className="title">Delete Account</h3>

        <p className="warning">Are you sure you want to delete your account? This action can't be undone. It will erase all your account details and chatbots as well.</p>

        <div className="col-2">
          <button onClick={() => close("dialog-outer")} className="hover outline">Cancel</button>
          <button onClick={onSubmit} className="hover primary submit-btn danger">{isProcess ? (<span className="loading mini"></span>) : "Delete"}</button>
        </div>

      </div>
    </div>}</>
}

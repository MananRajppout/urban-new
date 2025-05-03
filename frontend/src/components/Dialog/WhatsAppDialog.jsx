import React, { useContext, useEffect, useRef, useState } from "react";

import Steps from "../Widget/Steps";
import Toggle from "../Widget/Toggle";
import toast from "react-hot-toast";
import { addWhatsappIntegration, removeWhatsappIntegration, verifyWhatsapp } from "../../lib/api/ApiUpdateChatbot";
import { ServerDataContext } from "../../pages/my-chatbot/update/[id]";
import { useRouter } from "next/router";
import Link from "next/link";


export default function WhatsAppDialog({ isOpen, onDialogClose, defaultIndex = 0 }) {

  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState(0)
  const [isProcess, setIsProcess] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { serverData, setServerData } = useContext(ServerDataContext)

  useEffect(() => {
    setActiveTab(defaultIndex)
  }, [])


  const [formData, setFormData] = useState({
    whatsapp_phone_number: '',
    phone_number_id: '',
    whatsapp_business_ac_id: '',
    api_key: '',
    chat_model_id: id,
    is_active: true,
    integrate_id: ""
  })




  useEffect(() => {

    if (activeTab == 2 && isOpen) {
      loadDefaultData()
    }

  }, [activeTab, isOpen])


  async function loadDefaultData() {
    if (isLoaded || isProcess) return

    setIsProcess(true)
    const res = await verifyWhatsapp(id)
    setIsProcess(false)
    if (res.data) {
      setFormData((old) => {
        const clone = structuredClone(old)
        if (!formData.phone_number_id) {
          return {
            whatsapp_business_ac_id: res.data.integrate.whatsapp_business_ac_id,
            phone_number_id: res.data.integrate.phone_number_id,
            whatsapp_phone_number: res.data.integrate.whatsapp_phone_number,
            api_key: res.data.integrate.api_key,
            chat_model_id: id,
            is_active: res.data.integrate.is_active,
            integrate_id: res.data.integrate._id
          }
        } else {
          clone.chat_model_id = id
          clone.is_active = res.data.integrate.is_active
          clone.integrate_id = res.data.integrate._id
          return clone
        }
      })

      if (!res.data.integrate.whatsapp_business_ac_id) {
        setActiveTab(1)
        return
      }

      setIsLoaded(true)

    } else {
      toast.error(res.message)
      close('dialog-outer')
    }

  }


  async function onVerify() {
    if (isProcess) return

    setIsProcess(true)

    // "0e70e5da-c527-43cd-9992-71643a34eb19"
    const res = await verifyWhatsapp(id)
    console.log(res)

    if (res.data) {
      setServerData((old) => {
        const clone = structuredClone(old)
        clone.integrate_details.is_whatsapp_integrated = true
        return clone
      })
      changeTab(1)
    } else {
      toast.error(res.message)
    }

    setIsProcess(false)
  }



  function onAddAccount() {
    if (!formData.phone_number_id || !formData.whatsapp_business_ac_id || !formData.api_key || !formData.whatsapp_phone_number) {
      toast.error("All field should be filled first!")
      return
    }

    setActiveTab(2)
  }

  async function onSaveAccount() {
    if (isProcess) return

    if (!formData.phone_number_id || !formData.whatsapp_business_ac_id || !formData.api_key || !formData.whatsapp_phone_number) {
      toast.error("All field should be filled first!")
      setActiveTab(1)
      return
    }

    setIsProcess(true)
    const res = await addWhatsappIntegration(id, formData)

    if (res.data) {
      toast.success("Successfully saved")
    } else {
      toast.error(res.message)
    }

    setIsProcess(false)
  }


  function changeTab(index) {
    setActiveTab(index)
  }


  function close(className) {

    if (isProcess) return

    if (className == 'dialog-outer') {
      onDialogClose()
      changeTab(defaultIndex)
    }
  }


  function copy(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }



  function changeFormData(key, value) {

    setFormData((old) => {
      const clone = structuredClone(old)

      if (key == "whatsapp_phone_number") clone.whatsapp_phone_number = value
      if (key == "phone_number_id") clone.phone_number_id = value
      if (key == "whatsapp_business_ac_id") clone.whatsapp_business_ac_id = value
      if (key == "api_key") clone.api_key = value
      if (key == "is_active") clone.is_active = value
      return clone
    })
  }


  const [isDelete, setIsDelete] = useState(false)
  async function onDelete() {

    if (isProcess || isDelete) return
    setIsDelete(true)
    const res = await removeWhatsappIntegration(formData.integrate_id)
    setIsDelete(false)
    if (res.code == 200) {
      toast.success("Successfully deleted")
      setServerData((old) => {
        const clone = structuredClone(old)
        clone.integrate_details.is_whatsapp_integrated = false
        return clone
      })
      setActiveTab(0)

      close("dialog-outer")
    } else {
      toast.error(res.message)
    }
  }


  return <>
    {isOpen && <div className="dialog-outer" onClick={(e) => close(e.target.className)}>
      <div className="video-dialog">
        <div className="dialog">
          <h3 className="title">Integrate with WhatsApp</h3>
          <Steps count={3} index={activeTab} />
          {
            activeTab == 0 && <>
              <p className="note">Instruction for integrating your chatbot with WhatsApp <Link href="/integration/whatsapp">here</Link></p>

              <div className="input-container">
                <p className="heading">Webhook Callback URL</p>
                <div className="grid-auto-max">
                  <p className="text-field">https://urbanchat.ai/api/whatsapp/webhook</p>
                  <button onClick={(e) => copy("https://urbanchat.ai/api/whatsapp/webhook")} className="copy-btn hover"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z" /></svg></button>
                </div>
              </div>

              <div className="input-container">
                <p className="heading">Webhook Verification Token</p>
                <div className="grid-auto-max">
                  <p className="text-field">{id}</p>
                  <button onClick={(e) => copy(id)} className="copy-btn hover"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z" /></svg></button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: 8 }}>

                <a href="https://www.youtube.com/watch?v=KbBrGPfWVsU" target="_blank"><button className="submit-btn primary youtube hover" >Watch on Youtube</button></a>
                <button style={{ marginLeft: 0 }} className="primary submit-btn hover" onClick={onVerify}>{isProcess ? (<span className="loading mini"></span>) : "Verify"}</button>
              </div>
            </>

          }

          {activeTab == 1 && <>
            <div className="input-container">
              <p className="heading">WhatsApp Phone Number</p>
              <input style={{ width: '100%' }} value={formData.whatsapp_phone_number} onChange={(e) => changeFormData("whatsapp_phone_number", e.target.value)} className="text-field" />

            </div>

            <div className="input-container">
              <p className="heading">Phone Number Id</p>
              <input style={{ width: '100%' }} value={formData.phone_number_id} onChange={(e) => changeFormData("phone_number_id", e.target.value)} className="text-field" />
            </div>

            <div className="input-container">
              <p className="heading">WhatsApp Business Account Id</p>
              <input style={{ width: '100%' }} value={formData.whatsapp_business_ac_id} onChange={(e) => changeFormData("whatsapp_business_ac_id", e.target.value)} className="text-field" />
            </div>

            <div className="input-container">
              <p className="heading">WhatsApp Access Token</p>
              <input style={{ width: '100%' }} value={formData.api_key} onChange={(e) => changeFormData("api_key", e.target.value)} className="text-field" />
            </div>

            <button className="primary submit-btn hover" onClick={onAddAccount}>{isProcess ? (<span className="loading mini"></span>) : "Add Account"}</button>
          </>}

          {activeTab == 2 && isLoaded && <>
            <div className="status-card">
              <div className="left">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.75 2A2.25 2.25 0 0 1 18 4.25v15.5A2.25 2.25 0 0 1 15.75 22h-7.5A2.25 2.25 0 0 1 6 19.75V4.25A2.25 2.25 0 0 1 8.25 2h7.5Zm0 1.5h-7.5a.75.75 0 0 0-.75.75v15.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75Zm-2.501 14a.75.75 0 0 1 .002 1.5l-2.5.004a.75.75 0 0 1-.002-1.5l2.5-.004Z" fill="#2ECC70" /></svg>
                <span>{formData.integrate_id}</span>
              </div>
              <div className="right">
                <span>{formData.is_active ? "Active" : "Not Active"}</span>
                <Toggle isOn={formData.is_active} onToggle={(e) => changeFormData("is_active", e)} />
                <svg className="hover" onClick={() => setActiveTab(1)} width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.03 2.97a3.578 3.578 0 0 1 0 5.06L9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L15.97 2.97a3.578 3.578 0 0 1 5.06 0ZM15 6.06 5.062 16a.75.75 0 0 0-.193.333l-1.05 3.85 3.85-1.05A.75.75 0 0 0 8 18.938L17.94 9 15 6.06Zm2.03-2.03-.97.97L19 7.94l.97-.97a2.079 2.079 0 0 0-2.94-2.94Z" fill="#DDE6E8" /></svg>
                <svg className="hover" onClick={onDelete} width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z" fill="#E84B3C" /></svg>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "end", gap: 8, marginTop: 140 }}>
              <button onClick={() => close("dialog-outer")} style={{ margin: 0 }} className="primary submit-btn hover">Close</button>
              <button style={{ margin: 0 }} onClick={onSaveAccount} className="primary submit-btn hover">{isProcess ? (<span className="loading mini"></span>) : "Save"}</button>
            </div>
          </>}

        </div>

        <iframe width="420" height="345" src="https://www.youtube.com/embed/KbBrGPfWVsU">
        </iframe>
      </div>
    </div>}</>
}

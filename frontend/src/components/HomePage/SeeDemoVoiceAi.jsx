import React, { useState } from "react";
import AnimatedButton from "./VoiceAiWorkFlow/AnimatedButton";
import usaFlag from "@/assets/Icons/usa.png";
import { hangUpWebCall, makeWebCall } from "@/Utils/webCallHandler";
import CallScreen from "./CallScreen"; // Import CallScreen component
import { makeOutboundCall, makeOutboundCall2 } from "@/lib/api/ApiAiAssistant";
import toast from "react-hot-toast";
import Select from "react-select";

function SeeDemoVoiceAi() {
  const [switchTab, setSwitchTab] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [inCall, setInCall] = useState(false); // State to track if in call
  const [phoneIndustry, setPhoneIndustry] = useState("none");
  const [webIndustry, setWebIndustry] = useState("none");

  const switchPhoneTab = () => setSwitchTab(false);
  const switchWebTab = () => setSwitchTab(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "Phone") setPhoneNumber(value);
    else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDropdownChange = (e, dropdownType) => {
    const value = e.target.value;
    if (dropdownType === "phone") setPhoneIndustry(value);
    else if (dropdownType === "web") setWebIndustry(value);
  };

  const handleMakeWebCall = async (e) => {
    e.preventDefault();
    const demoAgentId = process.env["NEXT_PUBLIC_DENTAL_OFFICE_AGENT_ID"];
    makeWebCall(demoAgentId);
    setInCall(true);
  };

  async function handleOutboundCall(e) {
    e.preventDefault();
    const demoAgentId = process.env.NEXT_PUBLIC_DENTAL_OFFICE_AGENT_ID;
    if (phoneNumber[0] !== "+") {
      return toast.error("Invalid phone number. Please include country code.");
    }
    const from = process.env.NEXT_PUBLIC_DEMO_VOICE_PHONE_NUMBER;
    const to = phoneNumber.slice(1);
    const res = await makeOutboundCall2(from, to);
    if (res.data) {
      toast.success(`Calling on ${phoneNumber}`);
    } else {
      toast.error(res?.message || "Something went wrong");
    }
  }

  const renderInputs = (inputs, showDropdown = false, dropdownType) => {
    const industryValue =
      dropdownType === "phone" ? phoneIndustry : webIndustry;
    const handleIndustryChange = (selectedOption) => {
      if (dropdownType === "phone")
        setPhoneIndustry(selectedOption?.value || "none");
      else if (dropdownType === "web")
        setWebIndustry(selectedOption?.value || "none");
    };

    return (
      <>
        {inputs.map(({ label, name, type, placeholder }, index) => (
          <div className="input-wrap" key={index}>
            <label htmlFor={name} className="label">
              {label}
            </label>
            <input
              className="demo-input w-input"
              maxLength={256}
              name={name}
              placeholder={placeholder}
              type={type}
              required={type === "text"}
              value={name === "Phone" ? phoneNumber : formData[name]}
              onChange={handleInputChange}
              id={name}
            />
          </div>
        ))}
      </>
    );
  };

  const phoneInputs = [
    {
      label: "Phone number",
      name: "Phone",
      type: "text",
      placeholder: "+91-123-456-7890",
    },
    // { label: "Name", name: "name", type: "text", placeholder: "Jane" },
    // {
    //   label: "Email",
    //   name: "email",
    //   type: "email",
    //   placeholder: "jane@company.com",
    // },
  ];

  const webInputs = [
    // { label: "Name", name: "name", type: "text", placeholder: "Jane" },
    // {
    //   label: "Email",
    //   name: "email",
    //   type: "email",
    //   placeholder: "jane@company.com",
    // },
  ];

  return (
    <section
      className="relative flex flex-col py-8 items-center justify-center"
      style={{ paddingTop: 100 }}
    >
      <h2 className="primary-heading text-white">
        See A Live Demo With <br />a Hotel Receptionist
      </h2>
      <h2 className="subtitle text-white">
        Feel the state-of-the-art Voice Interaction
      </h2>
      <div className="demo-tabs w-demo-tabs grid w-[100vw] justify-center">
        <div className="tab-head-menu w-[100%] tab-box-layout">
          <a
            className={`demo-tab tab-inline-block w-tab-link ${!switchTab && "current-tab-btn"
              }`}
            aria-selected="true"
            onClick={switchPhoneTab}
          >
            <div className="text-white">Receive A Phone Call</div>
          </a>
          <a
            onClick={switchWebTab}
            className={`demo-tab tab-inline-block w-tab-link ${switchTab && "current-tab-btn"
              }`}
            role="tab"
            aria-selected="false"
            tabIndex={-1}
          >
            <div className="text-white">Try on Webcall</div>
          </a>
        </div>

        <div className="m-2">
          <div className="mail-block-form w-form">
            <form
              id="email-form"
              name="email-form"
              method="get"
              className="demo-form"
              aria-label="Email Form"
              onSubmit={switchTab ? handleMakeWebCall : handleOutboundCall}
            >
              {renderInputs(switchTab ? webInputs : phoneInputs, true)}
              <button
                type="submit"
                className="outline mt-5 font-bold"
                style={{ cursor: "pointer" }}
              >
                {switchTab ? "Initiate Call" : "Get the Call"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Call Screen */}
      {inCall && <CallScreen onClose={() => setInCall(false)} />}
    </section>
  );
}

export default SeeDemoVoiceAi;

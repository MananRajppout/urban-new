//this is the old code for phone numbers not now use

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import "@/styles/AiAssistant/phones.css"; // Assuming you have a CSS file for the page
import Dropdown from "@/components/Widget/Dropdown";
import deleteIcon from "@/assets/Icons/delete.svg";
import BuyPhoneNoDialog from "@/components/Dialog/BuyPhoneNoDialog";
import CallHandlerDialog from "@/components/Dialog/CallHandlerDialog";
import aiAgentImg from "@/assets/add-agent.png";
import { FaPlus } from "react-icons/fa";
import {
  deletePhoneNumber,
  fetchAiAgents,
  fetchPhoneNumbers,
  fetchSinglePhoneNumber,
  makeOutboundCall,
  updatePhoneNumber,
  fetchCountryAndPhoneNumbersCosts,
  makeOutboundCall2,
} from "@/lib/api/ApiAiAssistant";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import BuyPhoneNoDialog2 from "@/components/Dialog/BuyPhoneNoDialog2";
import { justPhoneNumber } from "@/lib/utils";
import Layout from "@/components/layout/Layout";

export default function handler() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [boughtPhoneNumbers, setBoughtPhoneNumbers] = useState([]);
  const [selectedNumberId, setSelectedNumberId] = useState(null);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [openCallHandlerDialog, setOpenCallHandlerDialog] = useState("");
  const [formData, setFormData] = useState({
    phone_number_pretty: "",
    phone_number: "",
    date_purchased: "",
    country: "",
    agent_id: "",
    status:"",
    number_type:"",
    number_location:"",
    monthly_rental_fee:"",
    currency:""
  });

  async function getBoughtPhoneNumber() {
    const res = await fetchPhoneNumbers();
    if (res.data) {
      const respondedNumbers = res?.data?.numbers;
      setBoughtPhoneNumbers(respondedNumbers);

      const phId = router.query.ph_id;
      console.log("get boutsPhoneNumber called", phId);

      if (phId) {
        setSelectedNumberId(phId);
        getSinglePhNo(phId);
      } else if (respondedNumbers.length > 0) {
        const firstPhoneNoId = respondedNumbers[0]._id;
        setSelectedNumberId(firstPhoneNoId);
        getSinglePhNo(firstPhoneNoId);
      }
    } else {
      toast.error("Failed to fetch agents");
    }
  }

  async function getSinglePhNo(phoneNumberId) {
    setSelectedNumberId(phoneNumberId);
    const res = await fetchSinglePhoneNumber(phoneNumberId); 
    if (res.data) {
      const phoneNumber = res.data.phone_number;
      console.log("phone number", phoneNumber);
      setFormData({
        phone_number_pretty:
          justPhoneNumber(phoneNumber?.phone_number, phoneNumber?.country) ||
          "IN",
        phone_number: phoneNumber?.phone_number || "",
        date_purchased: phoneNumber?.date_purchased || "",
        country: phoneNumber?.country || "",
        agent_id: phoneNumber?.agent_id || "",
        status:phoneNumber?.status || "",
        number_type:phoneNumber?.number_type || "",
        number_location:phoneNumber?.number_location || "",
        monthly_rental_fee:phoneNumber?.monthly_rental_fee || "",
        currency:phoneNumber?.currency || "",

      });
    } else {
      toast.error("Failed to fetch Phone Number details");
    }
  }

  const updatePhNo = async (agent_id) => {
    
    console.log(agent_id,selectedNumberId,'check for this')
    const res = await updatePhoneNumber(selectedNumberId, {
      agent_id: agent_id,
    });
    if (res.data) {
      toast.success("Phone Number updated successfully");
      getSinglePhNo(selectedNumberId);
      getAgents();
      // getBoughtPhoneNumber();
    } else {
      toast.error("Failed to update Phone Number");
    }
  };

  const deletePhNo = async () => {
    // for now just do nothing
    return;
    try {
      const res = await deletePhoneNumber(selectedNumberId);

      if (res.data) {
        toast.success("Phone Number Deleted successfully");

        const remainingPhoneNumbers = boughtPhoneNumbers.filter(
          (number) => number._id !== selectedNumberId
        );
        setBoughtPhoneNumbers(remainingPhoneNumbers);

        if (remainingPhoneNumbers.length > 0) {
          await router.replace({
            pathname: router.pathname,
            query: { ph_id: remainingPhoneNumbers[0]._id },
          });
          setSelectedNumberId(remainingPhoneNumbers[0]._id);
          getSinglePhNo(remainingPhoneNumbers[0]._id);
        } else {
          setSelectedNumberId(null);
          await router.replace(router.pathname);
        }
      } else {
        toast.error("Failed to delete Number");
      }
    } catch (error) {
      console.error("Error deleting Phone Number:", error);
      toast.error("An error occurred while deleting the Number");
    }
  };

  async function getAgents() {
    const res = await fetchAiAgents();
    if (res.data) {
      const respondedAgents = res?.data?.ai_agents;
      console.log("response", respondedAgents);
      setAgents(respondedAgents);
    } else {
      toast.error("Failed to fetch phone numbers");
    }
  }

  async function handleOutboundCall(phoneNumber) {
    const from = formData?.phone_number;
    const to = phoneNumber.slice(1);
    const res = await makeOutboundCall2(from, to);
    if (res.data) {
      toast.success(`calling from ${from} -> ${to}`);
      setOpenCallHandlerDialog("");
    } else {
      toast.error("Failed to call");
    }
  }

  useEffect(() => {
    if (selectedNumberId) {
      router.push({
        pathname: router.pathname,
        query: { ph_id: selectedNumberId },
      });
    }
  }, [selectedNumberId]);

  useEffect(() => {
    if (router.isReady) {
      getBoughtPhoneNumber();
    }
    getAgents();
  }, [router.isReady]);

  const agentsWithAssignedPhoneNumber = agents.map((agent) => ({
    ...agent,
    name: agent.plivo_phone_number
      ? `${agent.name} (${agent.plivo_phone_number})`
      : agent.name,
  }));

  return (
    <>
      <Head>
        <title>
          Custom AI Chatbot Solutions for Your Business | UrbanChat.ai
        </title>
        <meta
          name="description"
          content="Empower your online presence with UrbanChat.ai's customizable AI chatbots. Perfect for businesses looking to automate customer support, enhance engagement, and boost efficiency. Start building your ideal chatbot today and transform your customer interaction experience. Join the future of AI chatbots with UrbanChat.ai."
          key="desc"
        />
      </Head>
      <Layout>
        <div className="agent-container">
          <aside className="fixed_num">
            <button
              className="outline-btn1 gap-2"
              onClick={() => setOpenPhoneDialog(true)}
            >
              Add Phone Number
              <span className="icon-container bg-white text-black p-1 rounded-lg">
                <FaPlus />
              </span>{" "}
              {/* Plus Icon */}
            </button>
            {boughtPhoneNumbers?.map((ph_no) => (
              <button
                key={ph_no._id}
                className={` ${
                  selectedNumberId === ph_no._id
                    ? "fill-btn1 active"
                    : "ghost-btn"
                }`}
                onClick={() => getSinglePhNo(ph_no._id)}
              >
                {ph_no.phone_number}
              </button>
            ))}
          </aside>

          <main className="settings-container">
            {selectedNumberId ? (
              <>
                <header className="phone-header">
                  <div>
                    <div>
                      <h1>
                        {formData?.phone_number_pretty ||
                          formData?.phone_number}
                      </h1>
                      <p className="fade-text">
                        ID: {formData?.phone_number || formData?.phone_number}
                      </p>
                    </div>
                    <div className="flex-center">
                      <button
                        className="fill-btn"
                        onClick={() => setOpenCallHandlerDialog("outbound")}
                      >
                        Make an outbound call
                      </button>
                      <button
                        className="outline-btn"
                        onClick={() => setOpenCallHandlerDialog("inbound")}
                      >
                        Make an inbound call{" "}
                      </button>
                    </div>
                  </div>
                  {/* <button onClick={deletePhNo} className="gray-btn">
                    <img
                      className="delete-icon"
                      src={deleteIcon.src}
                      alt="Delete"
                    />
                  </button> */}
                </header>
                <div className="select-agent">
                  <h2>Select An Agent</h2>
                  <div className="dorp_agent">
                    <Dropdown
                      items={agentsWithAssignedPhoneNumber.map((agent) => ({
                        name: agent.name,
                        value: agent._id,
                      }))}
                      currentValue={formData?.agent_id || true}
                      placeholder={"Select AI Agent"}
                      onSelect={async (value) => {
                        updatePhNo(value);
                      }}
                      optionsClass="dropdown-options" // Custom class for the scrollable options
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="agent-container grid-center text-center">
                <div>
                  <img
                    src={aiAgentImg.src}
                    width={"400px"}
                    height={"400px"}
                    alt="add agent image"
                  />
                  <h3 className="fade-text">
                    Add a Phone Number to Start Your Journey{" "}
                  </h3>
                </div>
              </div>
            )}
          </main>

          <BuyPhoneNoDialog2
            isOpen={openPhoneDialog}
            setOpenPhoneDialog={setOpenPhoneDialog}
            getBoughtPhoneNumber={getBoughtPhoneNumber}
          />
          <CallHandlerDialog
            openDialog={openCallHandlerDialog}
            setOpenPhoneDialog={setOpenCallHandlerDialog}
            handleOutboundCall={handleOutboundCall}
          />
        </div>
      </Layout>
    </>
  );
}

/* // const twilioClient = new twilio(
// 	process.env.TWILIO_API_KEY,
// 	process.env.TWILIO_SECRET_KEY
// );

// TWILIO TEST CREDENTIALS
const twilioClient = new twilio(
  "AC9645779fc63ef23e65c2ca637346572d",
  "f126e5ac0d5ba812cf924d615ae1420e"
);

// TWILIO LIVE CREDENTIALS
// const twilioClient = new twilio(
//   "AC6ae797f2842665c66452799a7c5f2bc5",
//   "ded3545a2d2445e4f36c08d682d8ebb9"
// ); */

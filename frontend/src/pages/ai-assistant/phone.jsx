import React, { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Phone, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import AddNumberDialog from "@/components/Dialog/AddNumberDialog";
import PhoneNumberDetails from "@/components/Dialog/PhoneNumberDetails";
import {
  deletePlivoPhoneNumber,
  fetchAiAgents,
  fetchPhoneNumbers,
  fetchSinglePhoneNumber,
  updatePhoneNumber,
} from "@/lib/api/ApiAiAssistant";
import { formatDuration, justPhoneNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import { checkDuePayment, requestNumber as requestNumberApi } from "@/lib/api/ApiExtra";
import useVoiceInfo from "@/hooks/useVoice";
import { FaN } from "react-icons/fa6";

const initialPhoneNumbers = [
  {
    id: 1,
    number: "+1 (555) 123-4567",
    status: "Active",
    type: "Local",
    location: "New York, NY",
    assignedAgents: ["Emma Thompson", "Michael Chen"],
    minutesUsed: 450,
  },
  {
    id: 2,
    number: "+1 (555) 987-6543",
    status: "Active",
    type: "Toll-Free",
    location: "San Francisco, CA",
    assignedAgents: ["Sarah Davis"],
    minutesUsed: 320,
  },
  {
    id: 3,
    number: "+1 (555) 456-7890",
    status: "Inactive",
    type: "Local",
    location: "Austin, TX",
    assignedAgents: [],
    minutesUsed: 0,
  },
];

const PhoneNumbers = () => {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [selectedNumberId, setSelectedNumberId] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState(initialPhoneNumbers);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [boughtPhoneNumbers, setBoughtPhoneNumbers] = useState([]);
  const [formData, setFormData] = useState({
    phone_number_pretty: "",
    phone_number: "",
    date_purchased: "",
    country: "",
    agent_id: "",
    status: "",
    number_type: "",
    number_location: "",
    monthly_rental_fee: "",
    currency: "",
  });
  const [loadingPhoneNumber, setLoadingPhoneNumber] = useState(false);
  const [isMainWebsite, setIsMainWebsite] = useState(false);
  const [requestingNumber, setRequestingNumber] = useState(false);
  useEffect(() => {
    const isMainWebsite = window.location.hostname == process.env.NEXT_PUBLIC_MAIN_DOMAIN;
    setIsMainWebsite(isMainWebsite);
  }, []);

  const handleAddNumber = (newNumber) => {
    setPhoneNumbers([...phoneNumbers, newNumber]);
  };

  const handleRowClick = (phoneNumber, phone_number_id) => {
    setSelectedNumber(phoneNumber);
    setDetailsOpen(true);
    getSinglePhNo(phone_number_id);
  };

  const handleTerminateNumber = async (id) => {
    const res = await deletePlivoPhoneNumber(id);
    console.log(res, "check for res");
    toast.success("Number Delete Successfully..");
    getBoughtPhoneNumber();
    setAddDialogOpen(false);
    router.push({
      pathname: "/ai-assistant/phone",
    });
  };
  const voiceInfo = useVoiceInfo();

  async function getBoughtPhoneNumber() {
    const res = await fetchPhoneNumbers();
    if (res.data) {
      const respondedNumbers = res?.data?.numbers;
      setBoughtPhoneNumbers(respondedNumbers);

      console.log("get boutsPhoneNumber called", respondedNumbers);
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
        phone_number_pretty: phoneNumber?.country || "",
        phone_number: phoneNumber?.phone_number || "",
        date_purchased: phoneNumber?.date_purchased || "",
        country: phoneNumber?.country || "",
        agent_id: phoneNumber?.agent_id || "",
        status: phoneNumber?.status || "",
        number_type: phoneNumber?.number_type || "",
        number_location: phoneNumber?.number_location || "",
        monthly_rental_fee: phoneNumber?.monthly_rental_fee || "",
        currency: phoneNumber?.currency || "",
        total_call_duration: phoneNumber?.total_call_duration || "",
      });
    } else {
      toast.error("Failed to fetch Phone Number details");
    }
  }

  const updatePhNo = async (agent_id) => {
    setLoadingPhoneNumber(true);
    const res = await updatePhoneNumber(selectedNumberId, {
      agent_id: agent_id,
    });
    if (res.data) {
      toast.success("Phone Number updated successfully");
      getSinglePhNo(selectedNumberId);
      getAgents();
      getBoughtPhoneNumber();
    } else {
      toast.error("Failed to update Phone Number");
    }
    setLoadingPhoneNumber(false);
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

  const handleCheckDue = async (planId) => {
    try {
      const { data } = await checkDuePayment(planId);

      console.log(data, "check for data here");
      if (data.paymentDue) {
        window.open(data.hosted_invoice_url, "_blank"); // open Stripe invoice
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestNumber = async () => {
    setRequestingNumber(true);
    try {
      const res = await requestNumberApi();
      if (res.data) {
        toast.success("Number requested successfully");
      } else {
        toast.error("Failed to request number");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to request number");
    }finally{
      setRequestingNumber(false);
    }
   
  };

  return (
    <Layout className="bg-gradient-to-br from-[#121212] to-[#181824] text-foreground">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl font-medium text-white">Phone Numbers</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* <Button className="bg-accent-teal text-black hover:bg-accent-teal/90">
              <ArrowUpRight className="w-4 h-4 mr-2" /> Inbound Call
            </Button>
            <Button className="bg-accent-purple text-white hover:bg-accent-purple/90">
              <ArrowDownLeft className="w-4 h-4 mr-2" /> Outbound Call
            </Button> */}


            {
              isMainWebsite && (
                <Button
                  disabled={!voiceInfo.isVoiceAiActive}
                  className="border-0 cursor-pointer bg-glass-panel-light/30 text-white hover:bg-glass-panel-light/40"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Number
                </Button>
              )
            }
            {
              !isMainWebsite && (
                <Button
                  disabled={requestingNumber}
                  className="bg-accent-teal text-black hover:bg-accent-teal/90"
                  onClick={handleRequestNumber}
                >
                  {requestingNumber ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Request Number
                </Button>
              )
            }
          </div>
        </div>
        <div className="glass-panel rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Assigned Agents
                </TableHead>
                <TableHead className="text-right">Minutes Used</TableHead>
                <TableHead className="text-right">Renewal Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boughtPhoneNumbers?.map((phoneNumber) => (
                <TableRow
                  key={phoneNumber._id}
                  className="hover:bg-glass-panel-light/20 cursor-pointer"
                  onClick={() => handleRowClick(phoneNumber, phoneNumber._id)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-accent-teal/10 flex items-center justify-center mr-3">
                        <Phone className="w-5 h-5 text-accent-teal" />
                      </div>
                      <span>{phoneNumber.phone_number}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${phoneNumber.agent_name
                          ? "bg-sentiment-positive/20 text-sentiment-positive"
                          : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {phoneNumber.status || "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {phoneNumber.type}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {phoneNumber.number_location
                      ? phoneNumber.number_location
                      : phoneNumber.country === "IN"
                        ? "India"
                        : "United States"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${phoneNumber.agent_name
                          ? "bg-sentiment-positive/20 text-sentiment-positive"
                          : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {phoneNumber.agent_name ? phoneNumber.agent_name : "None"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(phoneNumber.total_call_duration)}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date() > new Date(phoneNumber.renewal_date) ? (
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation(); //Stop parent click
                          handleCheckDue(phoneNumber.plan_id);
                        }}
                      >
                        Pay Due
                      </button>
                    ) : (
                      new Date(phoneNumber.renewal_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <AddNumberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onNumberPurchased={handleAddNumber}
        getBoughtPhoneNumber={getBoughtPhoneNumber}
      />
      <PhoneNumberDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        phoneNumber={selectedNumber}
        onTerminate={handleTerminateNumber}
        formData={formData}
        agentsWithAssignedPhoneNumber={agentsWithAssignedPhoneNumber}
        updatePhNo={updatePhNo}
        loadingPhoneNumber={loadingPhoneNumber}
      />
    </Layout>
  );
};

export default PhoneNumbers;

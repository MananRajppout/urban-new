import React, { useEffect, useState } from "react";

import squareIcon from "../../../assets/Icons/historyIcon.svg";
import leadsIcon from "../../../assets/Icons/Leads.svg";
import bookingIcon from "../../../assets/Icons/booking.svg";

import "../../../styles/CreateChatbot/common.css";
import "../../../styles/CreateChatbot/dashboard.css";

import ChatHistory from "./ChatHistory";
import Leads from "./Leads";
import { useRouter } from "next/router";
import Link from "next/link";
import { getSubTabName, getSubTabIndex } from "@/Utils";
import Booking from "./Booking";

const tabContent = [
  {
    icon: squareIcon.src,
    text: "Chat History",
  },
  {
    icon: leadsIcon.src,
    text: "Leads",
  },
  {
    icon: bookingIcon.src,
    text: "Booking",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const router = useRouter();
  const { id, tab, sub_tab } = router.query;

  useEffect(() => {
    setActiveTab(getSubTabIndex(tab, sub_tab));
  }, [sub_tab]);

  function generateSubTabLink(index) {
    return `/my-chatbot/update/${id}?tab=${tab}&sub_tab=${getSubTabName(
      tab,
      index
    )}`;
  }

  return (
    <div className="main-content-holder medium">
      <div className="header">
        {tabContent.map((value, index) => {
          return (
            <Link key={index} href={generateSubTabLink(index)}>
              <div className={activeTab == index ? "tab active" : "tab"}>
                <img src={value.icon} />
                {value.text}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="content">
        {activeTab == 0 && <ChatHistory />}
        {activeTab == 1 && <Leads />}
        {activeTab == 2 && <Booking />}
      </div>
    </div>
  );
}

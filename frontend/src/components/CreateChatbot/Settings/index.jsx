import React, { useEffect, useState } from "react";

import squareIcon from "../../../assets/Icons/historyIcon.svg";
import modelIcon from "../../../assets/Icons/Model.svg";
import securityIcon from "../../../assets/Icons/Security.svg";
import leadsIcon from "../../../assets/Icons/Leads.svg";
import generalIcon from "../../../assets/Icons/General.svg";
import notificationIcon from "../../../assets/Icons/Notification.svg";
import domainIcon from "../../../assets/Icons/Domain.svg";
import "../../../styles/CreateChatbot/common.css";

import ChatInterface from "./ChatInterface";
import Model from "./Model";
import Security from "./Security";
import Leads from "./Leads";
import General from "./General";
import Notifications from "./Notifications";
import Domain from "./Domin";
import { useRouter } from "next/router";
import { getSubTabIndex, getSubTabName } from "@/Utils";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

const tabContent = [
  {
    icon: squareIcon.src,
    text: "Chat Interface",
  },
  {
    icon: modelIcon.src,
    text: "Model",
  },
  {
    icon: securityIcon.src,
    text: "Security",
  },
  {
    icon: leadsIcon.src,
    text: "Leads",
  },
  {
    icon: generalIcon.src,
    text: "General",
  },
  {
    icon: notificationIcon.src,
    text: "Notifications",
  },
  {
    icon: domainIcon.src,
    text: "Domain",
  },
];

export default function Settings({ serverData }) {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const { id, tab, sub_tab } = router.query;
  const { isAdmin } = useRole();

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
    <div className="main-content-holder relative">
      <div className="header hide-scroll">
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
        {activeTab == 0 && <ChatInterface serverData={serverData} />}
        {activeTab == 1 && <Model />}
        {activeTab == 2 && <Security />}
        {activeTab == 3 && <Leads />}
        {activeTab == 4 && <General />}
        {activeTab == 5 && <Notifications />}
        {activeTab == 6 && <Domain />}
      </div>
      {!isAdmin && (
        <div className=" w-full absolute h-full bg-gray-200 top-0 left-0 opacity-30 z-50"></div>
      )}
    </div>
  );
}

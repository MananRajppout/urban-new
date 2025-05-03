import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { useRouter } from "next/router";
import ai_logo from "@/assets/logo.svg";
import "@/styles/AiAssistant/index.css";
import { ProfileContext } from "../_app";
import BillingBanner from "../../components/ai-assistant/ai-agents/BillingBanner";
import {
  AiOutlineRobot,
  AiOutlinePhone,
  AiOutlineHistory,
  AiOutlineDollarCircle,
  AiOutlineDashboard,
} from "react-icons/ai";
import useVoiceInfo from "@/hooks/useVoice";
import { LoaderIcon } from "lucide-react";

const SidebarLayout = ({ children, customClass }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { globalProfileData } = useContext(ProfileContext);
  const [isTokenExist, setIsTokenExist] = useState(false);
  const [open, setOpen] = useState(false); // Sidebar expand/collapse state
  const router = useRouter();
  const { pathname } = router;

  // Check for small screen size on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Adjust for small screens
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if user has a token (authenticated)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsTokenExist(!!token); // Update token existence state
  }, []);

  const handleMouseEnter = () => {
    if (!open) setOpen(true);
  };

  const handleMouseLeave = () => {
    if (open) setOpen(false);
  };

  const { isVoiceAiActive, isLoading } = useVoiceInfo();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full fixed top-0 left-0 ">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="assistant-main flex">
      {/* Main Content */}
      <main
        className={`w-full flex ${customClass}`}
        style={{
          backgroundColor: "#10121B",
          transition: "margin-left 0.5s ease", // Smooth main content slide
          marginLeft: open ? "15rem" : "5rem", // Adjusted for smoother layout
        }}
      >
        <div className="agent-container">{children}</div>
      </main>

      {/* Sidebar */}
      <div
        className={`sidebar-container ${open ? "open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transition: "width 0.5s ease, opacity 0.5s ease", // Smooth transition
        }}
      >
        <aside
          className={` fixed top-0 left-0 h-screen p-5 rounded-r-lg ${
            open ? "w-60" : "w-20"
          }`}
          style={{
            transition: "width 0.5s ease", // Smooth width transition
          }}
        >
          {/* Sidebar Content */}
          <div>
            {/* Sidebar Logo */}
            <div
              className={`sidebar-logo flex items-center mb-6 overflow-hidden ${
                open ? "w-full" : "w-13"
              }`}
              style={{
                transition: "width 0.5s ease", // Smooth logo transition
              }}
            >
              <Link href="/" className="flex items-center">
                <img
                  className="logo block"
                  src={ai_logo.src}
                  alt="Urban Chat Logo"
                  style={{
                    transition: "opacity 0.5s ease", // Smooth logo fade-in/out
                    opacity: open ? 1 : 0.7,
                  }}
                />
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="menu w-full">
              <ul
                className={`flex flex-col gap-2 ${
                  open ? "items-start" : "items-center gap-5"
                } w-full`}
                style={{
                  transition: "gap 0.5s ease", // Smooth gap transition for menu
                }}
              >
                {[
                  { href: "/", icon: <FiHome />, label: "Home" },
                  {
                    href: "/ai-assistant/ai-agents",
                    icon: <AiOutlineRobot />,
                    label: "AI Agents",
                  },
                  {
                    href: "/ai-assistant/phones",
                    icon: <AiOutlinePhone />,
                    label: "Phones",
                  },
                  {
                    href: "/ai-assistant/history",
                    icon: <AiOutlineHistory />,
                    label: "Call History",
                  },
                  {
                    href: "/ai-assistant/billing",
                    icon: <AiOutlineDollarCircle />,
                    label: "Billing",
                  },
                  {
                    href: "/ai-assistant/dashboard",
                    icon: <AiOutlineDashboard />,
                    label: "Dashboard",
                  },
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href} className="w-full no-underline">
                    <li
                      className={`menu-item flex ${
                        open ? "justify-start" : "justify-center"
                      } items-center w-full p-2 rounded-md transition-all duration-300 ${
                        pathname === href
                          ? "bg-gray-600 text-white"
                          : "text-gray-200 hover:bg-gray-500 hover:text-white"
                      }`}
                      style={{
                        transition: "all 0.5s ease", // Smooth transition for each menu item
                      }}
                    >
                      <span className="text-lg">{icon}</span>
                      {open && (
                        <p
                          className="text-sm font-medium ml-2"
                          style={{
                            transition: "opacity 0.5s ease",
                            opacity: open ? 1 : 0,
                          }}
                        >
                          {label}
                        </p>
                      )}
                    </li>
                  </Link>
                ))}
              </ul>
            </nav>

            {/* Billing Banner */}
            {open && (
              <div
                className="bill_banner mt-40"
                style={{
                  transition: "opacity 0.5s ease",
                  opacity: open ? 1 : 0,
                }}
              >
                <BillingBanner />
              </div>
            )}

            {/* Profile Section */}
            <div className="profile-section absolute bottom-5 w-full flex flex-col items-start mb-5">
              {isTokenExist && globalProfileData ? (
                <Link className="profile-data no-underline" href="/my-profile">
                  {open && (
                    <p
                      className="text-white"
                      style={{
                        transition: "opacity 0.5s ease",
                        opacity: open ? 1 : 0,
                      }}
                    >
                      {/* {globalProfileData.email || "user@example.com"} */}
                    </p>
                  )}
                </Link>
              ) : (
                <div className="profile-placeholder">
                  <p className="text-white opacity-50">Not Logged In</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SidebarLayout;

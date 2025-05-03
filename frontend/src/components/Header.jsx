import React, { useContext, useEffect, useState } from "react";
import LightDarkToggle from "@/components/Widget/LightDarkToggle";
import "../styles/header.css";
import logo from "../assets/logo.svg";
import { ProfileContext } from "../pages/_app";
import Link from "next/link";
import ArrowIcon from "./icons/ArrowIcon";
import {
  initializeTelnyxClient,
  ensureValidToken,
} from "@/Utils/webCallHandler";
import { useRouter } from "next/router";
import { useRole } from "@/hooks/useRole";

export default function Header() {
  const router = useRouter();
  const { globalProfileData, setGlobalProfileData } =
    useContext(ProfileContext);

  const agentId = globalProfileData.agentId;
  const [isTokenExist, setIsTokenExist] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsTokenExist(true);
    } else {
      setIsTokenExist(false);
    }
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setActiveLink(currentPath);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // useEffect(() => {
  //   const pathname =
  //     typeof window !== "undefined" ? window.location.pathname : "";
  //   if (pathname === "/ai-assistant") {
  //     router.push("/ai-assistant/ai-agents");
  //   }
  // }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const checkValidToken = async () => {
        console.log("Checking valid token...");
        const validToken = await ensureValidToken(agentId);
        if (validToken) {
          console.log("Valid token found. Initializing Telnyx client...");
          await initializeTelnyxClient(validToken);
        }
      };
      checkValidToken();
    }
  }, [agentId]);

  // Check if we should hide the header based on the current route
  const shouldHideHeader =
    router.pathname === "/ai-voice-agent" ||
    router.pathname === "/ai-chatbot" ||
    router.pathname === "/voice-agents" ||
    router.pathname === "/subscription-plans" ||
    router.pathname === "/voice-agents/[id]" ||
    router.pathname === "/api-management" ||
    router.pathname === "/white-label" ||
    router.pathname === "/settings" ||
    router.pathname === "/documentation";

  // Only return null after all hooks have been called
  if (shouldHideHeader) {
    return null;
  }

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isHome = router.pathname === "/";
  const showBanner = isHome && !isTokenExist && isMounted;

  // Function to handle link click
  const handleLinkClick = (link) => {
    setActiveLink(link); // Set the clicked link as active
  };

  return (
    <header>
      <div className="page">
        <div className="left">
          <Link href="/" onClick={() => setActiveLink(null)}>
            <img className="logo" src={logo.src} />
          </Link>
        </div>
        <div className="flex flex-col items-center my-3 gap-1">
          {showBanner && (
            <div className="flex justify-center ml-[100px]">
              <p className="max-w-md bg-gray-900 text-white rounded-xl shadow-lg  text-xs  text-center py-2 px-4 border border-gray-700 m-2">
                🚀{" "}
                <span className="font-semibold text-yellow-400">
                  Sign Up Now
                </span>{" "}
                & Get <span className="text-green-400">60 mins</span> Free
                Trial!
              </p>
            </div>
          )}
          <div
            className={`center ${
              activeLink === "/pricing" ? "additional-class" : ""
            }`}
          >
            {isTokenExist ? (
              <>
                <Link href="/ai-voice-agent">
                  <span
                    className={
                      activeLink === "/ai-voice-agent" ||
                      pathname.startsWith("/ai-voice-agent")
                        ? "active-link"
                        : ""
                    }
                    onClick={() => handleLinkClick("/ai-voice-agent")}
                  >
                    AI Voice Agent
                  </span>
                </Link>
                <Link href="/my-chatbot">
                  <span
                    className={
                      activeLink === "/my-chatbot" ? "active-link" : ""
                    }
                    onClick={() => handleLinkClick("/my-chatbot")}
                  >
                    My Chatbot
                  </span>
                </Link>
                <Link href="/preview">
                  <span
                    className={activeLink === "/preview" ? "active-link" : ""}
                    onClick={() => handleLinkClick("/preview")}
                  >
                    Preview
                  </span>
                </Link>
                <Link href="/blogs">
                  <span
                    className={activeLink === "/blogs" ? "active-link" : ""}
                    onClick={() => handleLinkClick("/blogs")}
                  >
                    Blogs
                  </span>
                </Link>
                {isTokenExist ? (
                  <Pricing
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                ) : (
                  <Link href="/pricing">
                    <span
                      className={activeLink === "/pricing" ? "active-link" : ""}
                      onClick={() => handleLinkClick("/pricing")}
                    >
                      Pricing
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/ai-assistant">
                  <span
                    className={
                      activeLink === "/ai-assistant" ||
                      pathname.startsWith("/ai-assistant")
                        ? "active-link"
                        : ""
                    }
                    onClick={() => handleLinkClick("/ai-assistant")}
                  >
                    AI Voice Agent
                  </span>
                </Link>
                <Link href="/blogs">
                  <span
                    className={activeLink === "/blogs" ? "active-link" : ""}
                    onClick={() => handleLinkClick("/blogs")}
                  >
                    Blogs
                  </span>
                </Link>
                <Link href="/pricing">
                  <span
                    className={activeLink === "/pricing" ? "active-link" : ""}
                    onClick={() => handleLinkClick("/pricing")}
                  >
                    Pricing
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="right">
          {isTokenExist && (
            <Link className="profile-img" href="/my-profile">
              <img src={globalProfileData.image} />
            </Link>
          )}
          {isTokenExist ? (
            // {isTokenExist ? (
            <button className={`hover simple `}>
              <Link href="/ai-assistant" style={{ gap: 2 }}>
                Manage AI Voice Agent
                <ArrowIcon />
              </Link>
            </button>
          ) : (
            <>
              {!isTokenExist && (
                <>
                  <Link href="/login">
                    <button className="hover primary">Sign in</button>
                  </Link>
                  <Link href="/sign-up">
                    <button className="hover outline">Sign Up</button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Pricing({ activeLink, handleLinkClick }) {
  const { isRoleExist, canPricingRead } = useRole();
  if (!canPricingRead) return null;
  return (
    <Link href="/pricing">
      <span
        className={activeLink === "/pricing" ? "active-link" : ""}
        onClick={() => handleLinkClick("/pricing")}
      >
        Pricing
      </span>
    </Link>
  );
}

{
  /* <div className="right">

          {isTokenExist && (
            <Link className="profile-img" href="/my-profile">
              <img src={globalProfileData.image} />
            </Link>
          )}
          {isTokenExist ? (
            <button className="hover simple">
              <Link href="/my-chatbot">
                Manage chatbot
                <ArrowIcon />
              </Link>
            </button>
          ) : (
            <>
              <Link href="/login">
                <button className="hover primary">Sign in</button>
              </Link>

              <Link href="/sign-up">
                <button className="hover outline">Sign Up</button>
              </Link>
            </>
          )}
        </div> */
}

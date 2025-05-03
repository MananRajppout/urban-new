import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavItem from "./sidebar/NavItem";
import ServiceSelector from "./sidebar/ServiceSelector";
import UserProfile from "./sidebar/UserProfile";
import PricingPlan from "./sidebar/PricingPlan";
import Logo from "./sidebar/Logo";
import Bot from "../Bot";
import {
  voiceAgentOptions,
  chatbotOptions,
  generalNavItems,
} from "@/Utils/routes/SidebarRoutes";
import useVoiceInfo from "@/hooks/useVoice";

const Sidebar = ({ onServiceChange, activeService }) => {
  const router = useRouter();
  const pathname = router.pathname;
  const [mounted, setMounted] = useState(false);

  function setActiveService(service) {
    onServiceChange(service);
  }

  useEffect(() => {
    setMounted(true);
    if (pathname.includes("chat") || pathname.includes("leads")) {
      setActiveService("chatbot");
    } else {
      setActiveService("voice");
    }
  }, [pathname]);

  if (!mounted) {
    return (
      <aside className="w-64 fixed top-0 left-0 h-full glass-morphism border-r border-solid border-r-white/10 z-10 flex flex-col">
        <Logo />
        <div className="flex-1"></div>
      </aside>
    );
  }

  return (
    <aside className="w-64 fixed top-0 left-0 h-full glass-morphism border-r border-solid border-r-white/10 z-10 flex flex-col">
      <Logo />
      <nav className="flex-1 overflow-y-auto pt-4 scrollbar-none flex flex-col">
        <div className="px-2 mb-4">
          <ServiceSelector
            activeService={activeService}
            setActiveService={(s) => {
              setActiveService(s);
            }}
          />
        </div>
        <PricingPlan activeService={activeService} />
        <div className="space-y-1 px-2">
          {activeService === "voice"
            ? voiceAgentOptions.map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={
                    item.to === "/dashboard"
                      ? pathname === "/dashboard" || pathname === "/"
                      : pathname.startsWith(item.to)
                  }
                />
              ))
            : chatbotOptions.map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={pathname.startsWith(item.to)}
                />
              ))}
        </div>

        <div className="mt-6">
          <div className="px-6 py-2">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              General
            </h3>
          </div>
          <div className="space-y-1 px-2">
            {generalNavItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                isActive={pathname?.startsWith(item.to)}
              />
            ))}
          </div>
        </div>
      </nav>

      <UserProfile />
    </aside>
  );
};

export default Sidebar;

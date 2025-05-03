import React from "react";
import { Bell, Calendar, ChevronDown, User } from "lucide-react";
import useSWR from "swr";
import AxiosInstance from "@/lib/axios";

const Header = ({ children }) => {
  const { data: userInfo, isLoading } = useSWR(
    "/api/fetch-user-details",
    AxiosInstance.get
  );
  const userName = userInfo?.data?.user?.email || "";

  return (
    <header
      className="bg-black/50 backdrop-blur-sm h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20"
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex items-center">
        {/* This is where mobile menu button will be injected */}
        {children}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:space-x-6 overflow-x-auto scrollbar-none">
        {/* Current Date - Hide on very small screens */}
        <div className="hidden xs:flex items-center space-x-2 text-xs md:text-sm text-gray-300 whitespace-nowrap">
          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Plan expiry - Simplified on mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs md:text-sm text-gray-300 whitespace-nowrap">
          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-accent-teal" />
          <span>
            <span className="hidden sm:inline">Plan · </span>
            <span className="xs:hidden">
              {isLoading ? "Loading..." : userInfo?.data?.current_plan?.name}
            </span>
            <span className="hidden xs:inline">Expires: June 30</span>
          </span>
        </div>

        {/* Notifications */}
        <button className="relative bg-transparent border border-none p-1 md:p-2 rounded-full hover:bg-gray-800/50 transition-colors">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User profile */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-teal-800 flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5 text-teal-500" />
          </div>
          <span className="text-white text-xs md:text-sm hidden md:inline-block">
            {isLoading ? "Loading..." : userName}
          </span>
          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;

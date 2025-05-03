import React from "react";
import { User, ChevronDown, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR from "swr";
import AxiosInstance from "@/lib/axios";
import { useRouter } from "next/router";
import { UserIcon } from "lucide-react";

const UserProfile = () => {
  const router = useRouter();
  const { data: userInfo, isLoading } = useSWR(
    "/api/fetch-user-details",
    AxiosInstance.get
  );
  const userName = userInfo?.data?.user?.email || "";

  const handleLogout = () => {
    localStorage.clear();
    router.push("/signin");
  };

  return (
    <div className="p-3 border-t border-solid border-r-0 border-l-0 border-t-white/10">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full border-none bg-transparent">
          <div className="glass-panel py-0 px-3 rounded-lg flex items-center cursor-pointer group transition-colors hover:bg-glass-panel-light/30">
            <div className=" rounded-full bg-accent-teal/20 flex items-center justify-center p-1.5">
              <UserIcon size={20} className=" text-accent-teal" />
            </div>
            <div className="ml-2 flex-1 text-left">
              <p className="text-xs font-medium text-white mb-0">
                {isLoading ? "Loading..." : userName}
              </p>
              <p className="text-xs text-gray-400 mb-3 mt-0.5">
                {isLoading ? "Loading..." : userInfo?.data?.user?.user_type}
              </p>
            </div>
            <ChevronDown className="relative bottom-0 w-4 h-4 text-gray-400 group-hover:text-white" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 ml-4 glass-panel border border-solid border-[rgba(255,255,255,0.1)]">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
          <DropdownMenuItem className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
          <DropdownMenuItem
            className="cursor-pointer flex items-center text-sentiment-negative"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;

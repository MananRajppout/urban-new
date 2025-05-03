import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PhoneCall,
  Phone,
  Key,
  Palette,
  Settings,
  X,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import { CreditCard } from "lucide-react";
import { History } from "lucide-react";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { MessageSquare } from "lucide-react";

const MobileMenu = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: PhoneCall,
      label: "AI Voice Agent",
      href: "/ai-voice-agent",
    },
    {
      icon: MessageSquare,
      label: "AI Chatbot",
      href: "/ai-chatbot",
    },
    {
      icon: PhoneCall,
      label: "AI Agents",
      href: "/ai-assistant/ai-agents",
    },
    {
      icon: Phone,
      label: "Phones",
      href: "/ai-assistant/phone",
    },
    {
      icon: History,
      label: "Call History",
      href: "/ai-assistant/history",
    },
    {
      icon: CreditCard,
      label: "Billings",
      href: "/ai-assistant/billing",
    },
    {
      icon: Key,
      label: "API Management",
      href: "/api-management",
    },
    {
      icon: Palette,
      label: "White Label Service",
      href: "/white-label",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
    {
      icon: FileText,
      label: "Documentation",
      href: "/documentation",
    },
    {
      icon:CircleDollarSign,
      label:"Subscription",
      href:"/subscription-plans",
    }

  ];

  const handleItemClick = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Menu Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-80 glass-morphism border-r border-subtle-border z-10 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between h-20 border-b border-subtle-border px-6">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src={logo}
                  alt="logo"
                  width={140}
                  height={100}
                  className="cursor-pointer"
                />
              </Link>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-transparent rounded-lg border border-none hover:bg-glass-panel-light/30 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 bg-transparent text-white rounded-full" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto pt-4 scrollbar-none">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleItemClick}
                className={`no-underline flex items-center py-4 px-6 transition-all duration-200 group ${
                  (
                    item.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(item.href)
                  )
                    ? "border-l-4 border-accent-teal bg-glass-panel/40"
                    : "border-l-4 border-transparent hover:bg-glass-panel/20"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    (
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href)
                    )
                      ? "text-accent-teal"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    (
                      item.href === "/"
                        ? pathname === "/"
                        : pathname?.startsWith(item.href)
                    )
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

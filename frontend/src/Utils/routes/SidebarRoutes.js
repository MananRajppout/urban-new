import {
  Settings,
  Phone,
  Key,
  Palette,
  FileText,
  CreditCard,
  History,
  Grid3x3,
  UserCheck,
  MessageSquare,
  // BarChart3,
  Users,
  Bot,
} from "lucide-react";

const voiceAgentOptions = [
  {
    icon: Grid3x3,
    label: "Voice Dashboard",
    to: "/ai-voice-agent",
  },
  {
    icon: Users,
    label: "Voice Agents",
    to: "/voice-agents",
  },
  {
    icon: Phone,
    label: "Phone Numbers",
    to: "/ai-assistant/phone",
  },
  {
    icon: History,
    label: "Call History",
    to: "/ai-assistant/call-history",
  },
  {
    icon: CreditCard,
    label: "Billings",
    to: "/ai-assistant/billing",
  },
  // {
  //   icon: BarChart3,
  //   label: "Voice Analytics",
  //   to: "/voice-analytics",
  // },
];

const chatbotOptions = [
  {
    icon: Grid3x3,
    label: "Chat Dashboard",
    to: "/chat-dashboard",
  },
  {
    icon: MessageSquare,
    label: "Chat History",
    to: "/chat-history",
  },
  {
    icon: UserCheck,
    label: "Leads",
    to: "/leads",
  },
  {
    icon: Bot,
    label: "AI Chatbots",
    to: "/ai-chatbots",
  },
];

const generalNavItems = [
  {
    icon: Key,
    label: "API Management",
    to: "/api-management",
  },
  {
    icon: Palette,
    label: "White Label Service",
    to: "/white-label",
  },
  {
    icon: Settings,
    label: "Settings",
    to: "/settings",
  },
  {
    icon: FileText,
    label: "Documentation",
    to: "/documentation",
  },
];

export { voiceAgentOptions, chatbotOptions, generalNavItems };

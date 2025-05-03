import { Phone } from "lucide-react";
import { MessageSquare, Smartphone, Facebook, Globe } from "lucide-react";

export const getPlatformIcon = (platform) => {
  switch (platform) {
    case "website":
      return <Globe className="h-4 w-4 text-blue-500" />;
    case "facebook":
      return <Facebook className="h-4 w-4 text-indigo-500" />;
    case "whatsapp":
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case "instagram":
      return <Smartphone className="h-4 w-4 text-pink-500" />;
    case "phone":
      return <Phone className="h-4 w-4 text-blue-500" />;
    default:
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
  }
};

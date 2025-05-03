import React from "react";
import { Button } from "../dashboard/AiChatBot/components/button/Button";

const ContactSalesSection = ({
  onContactSales,
  title = "Need a Custom Plan?",
  description = "If you have specific requirements or need a tailored solution for your enterprise, our sales team is ready to help create the perfect plan for your business.",
  buttonText = "Contact Sales",
  email = "alex@urbanchat.ai",
  backgroundClass = "bg-gradient-to-br from-glass-panel-light/10 to-black",
}) => {
  return (
    <div
      className={`glass-panel p-8 text-center rounded-xl ${backgroundClass}`}
    >
      <h2 className="text-xl font-medium text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">{description}</p>
      <Button
        onClick={onContactSales}
        className="bg-gradient-to-r from-accent-purple/80 to-accent-purple text-white hover:from-accent-purple/70 hover:to-accent-purple/90 px-8"
        size="lg"
      >
        {buttonText}
      </Button>
      {email && <p className="text-gray-400 text-sm mt-4">Email: {email}</p>}
    </div>
  );
};

export default ContactSalesSection;

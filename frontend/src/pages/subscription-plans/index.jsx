import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/router";
import PricingLayout from "@/components/Pricing/PricingLayout";
import VoicePricingSection from "@/components/Pricing/VoicePricingSection";
import ChatbotPricingSection from "@/components/Pricing/ChatBotPricing";









  const SubscriptionPlans = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("voice");

  useEffect(() => {
    if (router.isReady) {
      const { tab } = router.query;
      if (tab === "chatbot") {
        setActiveTab("chatbot");
      } else if (tab === "voice") {
        setActiveTab("voice");
      }
    }
  }, [router.isReady, router.query]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab },
      },
      undefined,
      { shallow: true }
    );
  };





  return (
    <PricingLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <TabsContent value="voice" className="animate-in fade-in-50 duration-300">
        <VoicePricingSection />
      </TabsContent>

      <TabsContent
        value="chatbot"
        className="animate-in fade-in-50 duration-300"
      >
        <ChatbotPricingSection />
      </TabsContent>
    </PricingLayout>
  );
};

export default SubscriptionPlans;

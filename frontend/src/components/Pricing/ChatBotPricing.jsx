import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ChatbotPlanCard from "./ChatbotPlanCard";
import FeatureComparisonTable from "./FeatureComparisonTable";
import FreePlanSection from "./FreePlanSection";
import ContactSalesSection from "./ContactSalesSection";
import {  getPaymentSession, getPricingModel } from "@/lib/api/ApiExtra";
import { loadStripe } from "@stripe/stripe-js";
import { useRole } from "@/hooks/useRole";

const chatbotPlans = [
  {
    name: "Free Plan",
    price: "$0",
    messages: 30,
    chatbots: 1,
    characters: "400,000",
    features: [
      "Unlimited links for training",
      "Document upload for training",
      "Website embedding",
      "WordPress & Shopify integration",
      "Lead capture",
      "Video training",
      "Basic tech support",
    ],
    comingSoon: ["Training from audio files", "Chat routing to human support"],
    isCurrentPlan: false,
  },
  {
    name: "Hobby Plan",
    price: "$19",
    messages: 1000,
    chatbots: 2,
    characters: "1,100,000",
    features: [
      "Unlimited links for training",
      "Document upload for training",
      "Website embedding",
      "WordPress & Shopify integration",
      "Lead capture",
      "Video training",
      "24/7 support",
      "Priority support",
      "Soft delete",
    ],
    comingSoon: ["Training from audio files", "Chat routing to human support"],
    isCurrentPlan: true,
  },
  {
    name: "Standard Plan",
    price: "$49",
    messages: 4000,
    chatbots: 5,
    characters: "11,000,000",
    features: [
      "Unlimited links for training",
      "Document upload for training",
      "Website embedding",
      "WordPress & Shopify integration",
      "Lead capture",
      "Video training",
      "Premium 24/7 support",
      "Priority tech assistance",
      "Soft delete",
      'Remove "Powered by" branding',
    ],
    comingSoon: ["Training from audio files", "Chat routing to human support"],
    isCurrentPlan: false,
  },
  {
    name: "Unlimited Plan",
    price: "$389",
    messages: 40000,
    chatbots: 10,
    characters: "14,000,000",
    features: [
      "Unlimited links for training",
      "Document upload for training",
      "Website embedding",
      "WordPress & Shopify integration",
      "Lead capture",
      "Video training",
      "Premium 24/7 support",
      "Priority tech assistance",
      "Soft delete",
      'Remove "Powered by" branding',
    ],
    comingSoon: ["Training from audio files", "Chat routing to human support"],
    isCurrentPlan: false,
  },
];

const freePlan = chatbotPlans[0];

const paidPlans = chatbotPlans.slice(1);

const allChatbotFeatures = [
  "Unlimited links for training",
  "Document upload for training",
  "Website embedding",
  "WordPress & Shopify integration",
  "Lead capture",
  "Video training",
  "24/7 support",
  "Priority support",
  "Premium 24/7 support",
  "Priority tech assistance",
  "Soft delete",
  'Remove "Powered by" branding',
  "Training from audio files",
  "Chat routing to human support",
];






const ChatbotPricingSection = () => {

  const [selectedModelId, setselectedModelId] = useState(null);
  const [pricingData, setPricingData] = useState([])

  const { chatbotPlanId} = useRole ();
  async function fetchPricingData() {

    try {
      const data = await getPricingModel(); 

      console.log(data,'check for data>>>>>>')
      if (data?.data?.pricePlans) {
        return data.data.pricePlans;
      }
      return null;
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      return null;
    }
  }






  useEffect(() => {
    fetchPricingData().then((pricingData) => {
      const monthlyPaidPlans =pricingData?.filter(plan => plan.period === "month" && plan.cost > 0);

      setPricingData(monthlyPaidPlans)
    });
  }, [])

  const handleSelectPlan = (plan) => {
    toast.success(`You've selected the ${plan} plan`);
    // Implement plan selection logic here
  };

  const handleContactSales = () => {
    window.location.href = "mailto:alex@urbanchat.ai";
  };



  
  








  async function makePayment(pricing_id) {
    if (selectedModelId) {
      return;
    }
    console.log(pricing_id,'check for data>>>>>>')
    setselectedModelId(pricing_id);
    const res = await getPaymentSession({ pricing_plan_id: pricing_id });

    if (!res.data) {
      toast.error("Something went wrong");
      setselectedModelId(null);
      return;
    }



    // const stripePublicKey = "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1"
    // const stripePublicKey = "pk_test_51OZruHG2IW0ZBJvXA8Grc1gAqvc38VzWteVc04aq9bzDgQ7WR8IvWpIRvDJok4WczhDnaRUZqAXqCbvPgwJ0IoP200K5fGDPq1";
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

    const stripe = await loadStripe(stripePublicKey);
    const result = stripe.redirectToCheckout({
      sessionId: res.data.stripeSessionId,
    });
    setselectedModelId(null);
  }

  

  return (
    <>
      <div className="mb-12">
        <h2 className="text-xl md:text-2xl font-medium text-white mb-6 text-center">
          <span className="text-gradient-teal">Choose the Plan</span> That Fits
          Your Needs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingData?.map((plan, index) => (
            <ChatbotPlanCard
              key={plan.name}
              name={plan.name}
              price={`₹${plan.cost.toLocaleString()}`}
              messages={plan.messages_quota_user}
              chatbots={plan.number_of_chatbots}
              characters={plan.allowed_characters.toLocaleString()}
              features={plan.features}
              isCurrentPlan={chatbotPlanId === plan._id}  //check last
              index={index}
              onSelect={() => makePayment(plan._id)}
            />
          ))}
        </div>
      </div>

      {/* Features Comparison Table */}
      <FeatureComparisonTable
        plans={paidPlans}
        allFeatures={allChatbotFeatures}
      />

      {/* Free Plan Section */}
      <FreePlanSection
        plan={freePlan}
        onSelect={() => handleSelectPlan(freePlan.name)}
      />

      {/* Contact Sales Section */}
      <ContactSalesSection onContactSales={handleContactSales} />
    </>
  );
};

export default ChatbotPricingSection;

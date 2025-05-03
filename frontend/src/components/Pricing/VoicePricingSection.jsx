import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import VoicePlanCard from "./VoicePlanCard";
import ContactSalesSection from "./ContactSalesSection";
import { getPaymentSession, getPricingModelVoiceAi } from "@/lib/api/ApiExtra";
import { useRole } from "@/hooks/useRole";
import { loadStripe } from "@stripe/stripe-js";

const VoicePricingSection = () => {
  const { aiVoicePlanId, chatbotPlanId } = useRole();

  const handleSelectPlan = (plan) => {
    toast.success(`You've selected the ${plan} plan`);
  };

  const handleContactSales = () => {
    window.location.href = "mailto:alex@urbanchat.ai";
  };

  const [selectedModelId, setselectedModelId] = useState(null);
  const [pricingData, setPricingData] = useState([]);

  async function fetchPricingData() {
    try {
      const data = await getPricingModelVoiceAi();

      console.log(data, "check for data>>>>>>");
      if (data?.data?.pricePlans) {
        // Filter out the free plan
        const paidPlans = data.data.pricePlans.filter(
          (plan) => plan.cost > 0 && plan.name.toLowerCase() !== "free"
        );
        return paidPlans;
      }
      return null;
    } catch (error) {
      console.error("Error fetching pricing data:", error);
      return null;
    }
  }

  useEffect(() => {
    fetchPricingData().then((pricingData) => {
      setPricingData(pricingData || []);
    });
  }, []);

  async function makePayment(pricing_id) {
    if (selectedModelId) {
      return;
    }
    console.log(pricing_id, "check for pricing id>>>>>>");
    setselectedModelId(pricing_id);
    const res = await getPaymentSession({ pricing_plan_id: pricing_id });

    if (!res.data) {
      toast.error("Something went wrong");
      setselectedModelId(null);
      return;
    }

    if (!res.data.success) {
      toast.error(res.data.message);
      return;
    }

    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

    const stripe = await loadStripe(stripePublicKey);
    const result = stripe.redirectToCheckout({
      sessionId: res.data.stripeSessionId,
    });
    setselectedModelId(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    

        {pricingData &&
          pricingData.length > 0 &&
          pricingData.map((pricing) => (
            <VoicePlanCard
              key={pricing._id}
              title={pricing.name}
              price={`₹${pricing.cost.toLocaleString()}`}
              minutes={pricing.total_minutes_balance}
              features={pricing.benefits}
              isPopular={pricing.name === "Pro Plan"}
              isCurrentPlan={aiVoicePlanId === pricing._id}
              onSelect={() => makePayment(pricing._id)}
            />
          ))}
      </div>

      <ContactSalesSection
        onContactSales={handleContactSales}
        title="Need More Minutes?"
        description="Contact our sales team for custom plans with additional minutes or special requirements"
        buttonText="Contact Sales at alex@urbanchat.ai"
      />
    </>
  );
};

export default VoicePricingSection;

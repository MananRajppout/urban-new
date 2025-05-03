import React, { useEffect,useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Link from "next/link";
import { getPaymentSession, getPricingModelVoiceAi } from "@/lib/api/ApiExtra";
import { loadStripe } from "@stripe/stripe-js";
import { useRole } from "@/hooks/useRole";
import toast from "react-hot-toast";


const PricingPage = () => {
  useEffect(() => {
    document.title = "Pricing Plans | UrbanChat.ai";
  }, []);

  // const plans = [
  //   {
  //     name: "Basic Plan",
  //     price: "3,500",
  //     currency: "₹",
  //     minutes: "500 minutes",
  //     features: [
  //       { name: "AI Voice Agent Access", included: true },
  //       { name: "Detailed Analytics & Reporting (coming soon)", included: true },
  //       { name: "Dashboard Interface", included: true },
  //       { name: "Call History", included: true },
  //       { name: "Call Recordings", included: true },
  //       { name: "Cal.com Integration", included: true },
  //       { name: "Google Sheet Integration", included: true },
  //       { name: "Bulk Cold Calling", included: true },
  //     ],
  //   },
  //   {
  //     name: "Pro Plan",
  //     price: "13,999",
  //     currency: "₹",
  //     minutes: "2,000 minutes",
  //     isPopular: true,
  //     features: [
  //       { name: "AI Voice Agent Access", included: true },
  //       { name:  "Detailed Analytics & Reporting (coming soon)", included: true },
  //       { name: "Dashboard Interface", included: true },
  //       { name: "Call History", included: true },
  //       { name: "Call Recordings", included: true },
  //       { name: "Cal.com Integration", included: true },
  //       { name: "Google Sheet Integration", included: true },
  //       { name: "Bulk Cold Calling", included: true },
  //     ],
  //   },
  //   {
  //     name: "Enterprise Plan",
  //     price: "35,000",
  //     currency: "₹",
  //     minutes: "5,000 minutes",
  //     features: [
  //       { name: "AI Voice Agent Access", included: true },
  //       { name:  "Detailed Analytics & Reporting (coming soon)", included: true },
  //       { name: "Dashboard Interface", included: true },
  //       { name: "Call History", included: true },
  //       { name: "Call Recordings", included: true },
  //       { name: "Cal.com Integration", included: true },
  //       { name: "Google Sheet Integration", included: true },
  //       { name: "Bulk Cold Calling", included: true },
  //     ],
  //   },
  // ];


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
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="py-8 md:py-16 relative">
          <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />

          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                <span className="inline-block">Affordable </span>
                <span className="inline-block text-gradient">
                  Pricing Plans
                </span>
              </h1>
              <p className="text-base md:text-xl text-foreground/70">
                Choose the perfect plan for your business needs with transparent
                pricing and no hidden fees.
              </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
              {pricingData.map((plan, index) => (
                <div
                  key={index}
                  className={`relative glass-panel rounded-xl p-4 md:p-8 border ${
                    plan.name === "Pro Plan" ? "border-brand-green" : "border-white/10"
                  } transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/10 hover:-translate-y-1`}
                >

{plan._id === aiVoicePlanId && (
        <div className="absolute -top-3 right-3 bg-yellow-500/90 px-3 py-1 rounded-full text-xs font-medium text-black flex items-center">
          <Crown className="w-3 h-3 mr-1" />
          Current
        </div>
      )}
                  {plan.name === "Pro Plan"&& (
                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-teal px-4 py-1 rounded-full text-xs font-medium text-black">
                   Popular
                 </div>
                  )
                  
                  }

                  
   

                  <h3 className="text-xl md:text-2xl font-semibold mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4 md:mb-6">
                    <span className="text-2xl md:text-4xl font-bold">
              
                    ₹{plan.cost}
                    </span>
                    <span className="text-foreground/70 ml-2">/month</span>
                  </div>

                  <div className="text-lg md:text-xl font-medium mb-4 md:mb-6 text-brand-green">
                    {plan.total_minutes_balance} minutes
                  </div>

                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-sm md:text-base">
                    {plan.benefits.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green mr-2 md:mr-3 mt-0.5 flex-shrink-0" />
                        <span
                          className={`text-foreground/80 ${
                            feature.comingSoon
                              ? "flex items-center flex-wrap"
                              : ""
                          }`}
                        >
                          {feature}
                          {/* {feature.comingSoon && (
                            <span className="ml-1 md:ml-2 text-xs bg-white/10 text-foreground/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                              Coming Soon
                            </span>
                          )} */}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* <Link href="/signup"> */}
                    <Button
                      className={`w-full ${
                      plan.name === "Pro Plan"
                          ? "bg-brand-green border-0 cursor-pointer hover:bg-brand-green-dark text-black"
                          : "bg-white/10 hover:bg-white/20 border-0 cursor-pointer text-white"
                      } font-semibold py-4 md:py-6 text-sm md:text-base`}
                      onClick ={()=>makePayment(plan._id)}
                    >
                      Select Plan
                    </Button>
                  {/* </Link> */}
                </div>
              ))}
            </div>

            <div className="text-center mt-8 md:mt-16 max-w-3xl mx-auto glass-panel rounded-xl p-4 md:p-8 border border-white/10">
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-4">
                Need More Minutes?
              </h3>
              <p className="text-sm md:text-base text-foreground/70 mb-4 md:mb-6">
                Contact our sales team for custom plans with additional minutes
                or special requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link href="/contact">
                  <Button className="bg-brand-green hover:bg-brand-green-dark text-black font-semibold text-sm md:text-base">
                    Contact Sales
                  </Button>
                </Link>
                <div className="text-sm md:text-base text-foreground/70">
                  Email:{" "}
                  <a
                    href="mailto:alex@urbanchat.ai"
                    className="text-brand-green hover:underline"
                  >
                    alex@urbanchat.ai
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;

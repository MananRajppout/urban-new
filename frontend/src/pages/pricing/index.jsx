import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Link from "next/link";
import { getPaymentSession, getPricingModelVoiceAi, getRazorpaySession, getRazorpaySuccessCallback } from "@/lib/api/ApiExtra";
import { loadStripe } from "@stripe/stripe-js";
import { useRole } from "@/hooks/useRole";
import toast from "react-hot-toast";
import { useApp } from "@/context/AppContext";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";


const PricingPage = () => {
  const { websiteSettings } = useApp();
  useEffect(() => {
    document.title = `Pricing Plans | ${websiteSettings?.custom_domain || websiteSettings?.slug_name}`;
  }, [websiteSettings]);
  const { error, isLoading, Razorpay } = useRazorpay();


  const { aiVoicePlanId, chatbotPlanId } = useRole();
  const handleSelectPlan = (plan) => {
    toast.success(`You've selected the ${plan} plan`);
  };

  const handleContactSales = () => {
    window.location.href = "mailto:alex@urbanchat.ai";
  };

  const [selectedModelId, setselectedModelId] = useState(null);
  const [pricingData, setPricingData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('international'); // 'india' or 'international'

  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let totalSeconds = prevTime.hours * 3600 + prevTime.minutes * 60 + prevTime.seconds - 1;

        if (totalSeconds < 0) {
          totalSeconds = 4 * 3600; // Reset to 4 hours
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Currency conversion rate (INR to USD approximately)
  const INR_TO_USD_RATE = 0.012;

  // Convert pricing data for international users
  const transformPricingForRegion = (plans, region) => {
    if (!plans) return [];

    if (region === 'india') {
      return plans;
    }

    // Transform for international users (convert to USD)
    return plans.map(plan => ({
      ...plan,
      cost: Math.ceil(plan.cost * INR_TO_USD_RATE), // Convert INR to USD and round up
      originalCost: plan.cost, // Keep original cost for reference
    }));
  };

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


  const makePayment = async (pricing_id) => {
    if(selectedRegion === 'india'){
      makePaymentRazorpay(pricing_id);
    }else{
      makePaymentStripe(pricing_id);
    }
  }

  async function makePaymentRazorpay(pricing_id) {
    const isLogin = localStorage.getItem("access_token");
    if (!isLogin) {
      toast.error("Please login to continue");
      window.location.href = "/signin";
      return;
    }

    if (selectedModelId) {
      return;
    }

    console.log(pricing_id, "check for pricing id>>>>>>");
    setselectedModelId(pricing_id);
    const res = await getRazorpaySession({ pricing_plan_id: pricing_id });

    if (!res.data) {
      toast.error("Something went wrong");
      setselectedModelId(null);
      return;
    }

    if (!res.data.success) {
      toast.error(res.data.message);
      return;
    }



    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: res.data.price * 100, // Amount in paise
      currency: "INR",
      name: websiteSettings?.website_name || "Urban Chat",
      description: "Test Transaction",
      order_id: res.data.order_id, // Generate order_id on server
      handler: (response) => {
        console.log(response, "check for response>>>>>>");
        getRazorpaySuccessCallback({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          plan_type: res.data.planType,
          session_id: res.data.orderId
        })
      },
      prefill: {
        name: res.data.user.full_name,
        email: res.data.user.email,
      },
      theme: {
        color: "#48e2b3",
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  }

  async function makePaymentStripe(pricing_id) {

    //check is login or not
    const isLogin = localStorage.getItem("access_token");
    if (!isLogin) {
      toast.error("Please login to continue");
      window.location.href = "/signin";
      return;
    }

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



            <div className="text-center mb-8">
              <div className="inline-block glass-panel rounded-xl p-4 border border-brand-green/30">
                <p className="text-lg font-medium text-brand-green">
                  🎉 Special Offer Ends In:{" "}
                  <span className="font-bold">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  Get 20% off on annual plans
                </p>
              </div>
            </div>


            {/* Region Toggle */}
            <div className="flex flex-col items-center mb-8">
              <div className="inline-flex glass-panel rounded-xl p-1 border border-white/10 mb-3 space-x-2">
                <button
                  className={`px-6 py-3 border-none rounded-lg font-medium text-sm transition-all duration-300 ${selectedRegion === 'india'
                      ? 'bg-brand-green text-black shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  onClick={() => setSelectedRegion('india')}
                >
                  India
                </button>
                <button
                  className={`px-6 py-3 border-none rounded-lg font-medium text-sm transition-all duration-300 ${selectedRegion === 'international'
                      ? 'bg-brand-green text-black shadow-lg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  onClick={() => setSelectedRegion('international')}
                >
                  Rest of the world
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
              {transformPricingForRegion(pricingData, selectedRegion).map((plan, index) => (
                <div
                  key={index}
                  className={`relative glass-panel rounded-xl p-4 md:p-8 border ${plan.name === "Pro Plan" ? "border-brand-green" : "border-white/10"
                    } transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/10 hover:-translate-y-1`}
                >

                  {plan._id === aiVoicePlanId && (
                    <div className="absolute -top-3 right-3 bg-yellow-500/90 px-3 py-1 rounded-full text-xs font-medium text-black flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      Current
                    </div>
                  )}
                  {plan.name === "Pro Plan" && (
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
                      {selectedRegion === 'india' ? '₹' : '$'}{plan.cost}
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
                          className={`text-foreground/80 ${feature.comingSoon
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

                  {/* International pricing note */}
                  {selectedRegion === 'international' && (
                    <p className="text-xs text-foreground/60 mb-3 text-center">
                      *Converted from ₹{plan.originalCost || plan.cost} INR
                    </p>
                  )}

                  {/* <Link href="/signup"> */}
                  <Button
                    className={`w-full ${plan.name === "Pro Plan"
                        ? "bg-brand-green border-0 cursor-pointer hover:bg-brand-green-dark text-black"
                        : "bg-white/10 hover:bg-white/20 border-0 cursor-pointer text-white"
                      } font-semibold py-4 md:py-6 text-sm md:text-base`}
                    onClick={() => makePayment(plan._id)}
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

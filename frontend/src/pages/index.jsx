import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LiveDemoSection from "@/components/LiveDemoSection";
import IntegrationsSection from "@/components/IntegrationsSection";
import { useApp } from "@/context/AppContext";

function useQuery() {
  const router = useRouter();

  return React.useMemo(
    () => new URLSearchParams(router.asPath.split("?")[1] || ""),
    [router.asPath]
  );
}

function Home() {
  let query = useQuery();
  const [isUserExist, setIsUserExist] = useState(false);
  const router = useRouter();
  const {websiteSettings} = useApp();

  useEffect(function () {
  
    console.log(query.get("token"))
    if (query.get("token")) {
      localStorage.setItem("access_token", query.get("token"));
      const event = new Event("signup");
      window.dispatchEvent(event);
      setTimeout(() => {
        router.push("/");
      }, 1000);
      
    }
  }, []);

  useEffect(() => {
    setIsUserExist(localStorage.getItem("access_token") ? true : false);
    const event = new Event("storage");
    window.dispatchEvent(event);
  }, []);
  

  


  return (
    <>
      <Head>
        <title>
          {websiteSettings?.custom_domain || websiteSettings?.slug_name}: Revolutionize Your Customer Engagement with Our AI
          Chatbot
        </title>
        <meta
          name="description"
          content={websiteSettings?.meta_description || "Improve customer service with AI chatbots. Streamline interactions, boost engagement, and drive sales with 24/7 support in 40+ languages. Integrate with your website."}
          key="desc"
        />
      </Head> 

   

      <div className="relative min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <LiveDemoSection />
          <IntegrationsSection />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Home;

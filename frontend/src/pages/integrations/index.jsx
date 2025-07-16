import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import IntegrationsSection from "@/components/IntegrationsSection";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

const IntegrationsPage = () => {
  const {websiteSettings} = useApp();
  useEffect(() => {
    document.title = `Integrations | ${websiteSettings?.custom_domain || websiteSettings?.slug_name}`;
  }, [websiteSettings]);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="py-16 relative">
          <div className="absolute -z-10 top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -z-10 bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />

          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="inline-block">Seamless </span>
                <span className="inline-block text-gradient">Integrations</span>
              </h1>
              <p className="text-xl text-foreground/70">
                Connect {websiteSettings?.website_name || "UrbanChat.ai"} with your existing tools and platforms to
                create a unified workflow.
              </p>
            </div>
          </div>
        </section>

        {/* Reuse the existing IntegrationsSection component */}
        <IntegrationsSection />

        {/* API Integration section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="glass-panel rounded-xl p-8 border border-white/10 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">Developer API</h2>
                  <p className="text-foreground/70 mb-6">
                    Need a custom integration? Our comprehensive API allows
                    developers to build tailored solutions that perfectly fit
                    your business requirements.
                  </p>
                  <Button className="bg-brand-green cursor-pointer border-0 hover:bg-brand-green-dark text-black font-semibold">
                    <PlusCircle className="mr-2 h-4 w-4" /> Request API Access
                  </Button>
                </div>
                <div className="flex-1 glass-panel p-4 rounded-lg border border-white/10 overflow-hidden">
                  <pre className="text-xs md:text-sm overflow-x-auto">
                    <code className="text-foreground/80">
                      {`// Example API usage
const response = await fetch('https://api.${websiteSettings?.custom_domain || websiteSettings?.slug_name}.com/v1/calls', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '+1234567890',
    agentId: 'agent_12345',
    context: {
      customerName: 'John Doe',
      appointmentTime: '2023-06-01T10:00:00Z'
    }
  })
});`}
                    </code>
                  </pre>
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

export default IntegrationsPage;

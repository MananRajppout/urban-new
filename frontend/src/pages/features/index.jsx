import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import FeaturesSection from "@/components/FeaturesSection";
import ParticleBackground from "@/components/ParticleBackground";

const FeaturesPage = () => {
  useEffect(() => {
    document.title = "Features | UrbanChat.ai";
  }, []);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-24 pb-20">
        <section className="py-16 relative">
          <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />

          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="inline-block">Powerful </span>
                <span className="inline-block text-gradient">Features</span>
              </h1>
              <p className="text-xl text-foreground/70">
                Explore all the capabilities of our AI voice agents and how they
                can transform your business operations.
              </p>
            </div>
          </div>
        </section>

        {/* Reuse the existing FeaturesSection component */}
        <FeaturesSection />

        {/* Additional feature details section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="glass-panel rounded-xl p-8 border border-white/10 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">How It Works</h2>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Create Your AI Voice Agent
                    </h3>
                    <p className="text-foreground/70">
                      Define your agent&rsquo;s personality, knowledge base, and
                      conversation flows to align with your brand and business
                      needs.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Your Systems
                    </h3>
                    <p className="text-foreground/70">
                      Integrate with your existing tools like calendars, CRMs,
                      or custom databases to enable your agent to access
                      relevant information.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Deploy and Scale
                    </h3>
                    <p className="text-foreground/70">
                      Launch your AI voice agent to handle calls 24/7, and
                      easily scale up as your business grows without adding
                      human staff.
                    </p>
                  </div>
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

export default FeaturesPage;

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import { useApp } from "@/context/AppContext";

const ContactPage = () => {
  const { websiteSettings } = useApp();
  useEffect(() => {
    document.title = "Contact Us | UrbanChat.ai";
  }, []);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="pt-5 pb-20">
        <section className="py-16 relative">
          <div className="absolute -z-10 top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -z-10 bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-brand-green/5 blur-[120px] animate-pulse-slow animation-delay-1000" />

          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="inline-block">Get in </span>
                <span className="inline-block text-gradient">Touch</span>
              </h1>
              <p className="text-xl text-foreground/70">
                Have questions or need more information? Our team is ready to
                help you implement AI voice agents for your business.
              </p>
            </div>

            <div
              className="max-w-3xl mx-auto glass-panel rounded-xl p-8 border border-white/10"
              style={{
                background: "rgb(255 255 255 / 0.05)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-foreground/70">Email:</p>
                      <a
                        href="mailto:alex@urbanchat.ai"
                        className="text-brand-green hover:underline text-lg"
                      >
                        {websiteSettings?.email || "alex@urbanchat.ai"}
                      </a>
                    </div>
                    {/* <div>
                      <p className="text-foreground/70">For Sales Inquiries:</p>
                      <a
                        href="mailto:sales@urbanchat.ai"
                        className="text-brand-green hover:underline text-lg"
                      >
                        sales@urbanchat.ai
                      </a>
                    </div>
                    <div>
                      <p className="text-foreground/70">For Support:</p>
                      <a
                        href="mailto:support@urbanchat.ai"
                        className="text-brand-green hover:underline text-lg"
                      >
                        support@urbanchat.ai
                      </a>
                    </div> */}
                  </div>
                </div>

                {/* <div
                  className="glass-panel border border-white/10 p-6 rounded-lg"
                  style={{
                    background: "rgb(255 255 255 / 0.05)",
                    border: "1px solid rgb(255 255 255 / 0.1)",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4">
                    Schedule a Consultation
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    Book a free 30-minute consultation with our team to discuss
                    how UrbanChat.ai can help your business.
                  </p>
                  <Button className="w-full bg-brand-green border-0 cursor-pointer hover:bg-brand-green-dark text-black font-semibold py-6">
                    Book a Consultation
                  </Button>
                </div> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;

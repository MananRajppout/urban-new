import React, { useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { useApp } from "@/context/AppContext";

const PrivacyPolicy = () => {
  const { websiteSettings } = useApp();

  useEffect(() => {
    document.title = `Privacy Policy | ${websiteSettings?.custom_domain || websiteSettings?.slug_name}`;
  }, [websiteSettings]);

  return (
    <>
      <Head>
        <title>
          Privacy Policy | {websiteSettings?.custom_domain || websiteSettings?.slug_name || "UrbanChat.ai"}
        </title>
        <meta
          name="description"
          content="Privacy Policy for our AI chatbot and voice agent platform. Learn how we protect your data and respect your privacy."
          key="desc"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="relative min-h-screen">
        <ParticleBackground />
        <Navbar />

        <main className="pt-5 pb-20">
          <section className="py-16 relative">
            <div className="absolute -z-10 top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
            <div className="absolute -z-10 bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-brand-green/5 blur-[120px] animate-pulse-slow animation-delay-1000" />

            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="inline-block">Privacy </span>
                  <span className="inline-block text-gradient">Policy</span>
                </h1>
                <p className="text-xl text-foreground/70">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                </p>
                <p className="text-sm text-foreground/50 mt-4">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div
                className="max-w-4xl mx-auto glass-panel rounded-xl p-8 md:p-12 border border-white/10"
                style={{
                  background: "rgb(255 255 255 / 0.05)",
                }}
              >
                <div className="prose prose-invert max-w-none">
                  
                  {/* Custom Policy Text from Settings */}
                  {websiteSettings?.policy_text && (
                    <div className="mb-12 p-6 rounded-lg bg-brand-green/10 border border-brand-green/20">
                      <h2 className="text-2xl font-semibold mb-4 text-brand-green">
                        Our Commitment
                      </h2>
                      <div className="whitespace-pre-wrap text-foreground/80">
                        {websiteSettings.policy_text}
                      </div>
                    </div>
                  )}

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      1. Information We Collect
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <h3 className="text-lg font-medium text-white">Personal Information</h3>
                      <p>
                        We may collect personal information that you voluntarily provide to us when you:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Register for an account</li>
                        <li>Use our AI chatbot or voice agent services</li>
                        <li>Contact us for support</li>
                        <li>Subscribe to our newsletter</li>
                        <li>Participate in surveys or feedback forms</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium text-white mt-6">Usage Information</h3>
                      <p>
                        We automatically collect certain information about your device and usage patterns, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>IP address and browser information</li>
                        <li>Pages visited and time spent on our platform</li>
                        <li>Chat interactions and voice recordings (when using our services)</li>
                        <li>Device type, operating system, and browser type</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      2. How We Use Your Information
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        We use the information we collect for various purposes, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Providing and maintaining our AI services</li>
                        <li>Improving our chatbot and voice agent capabilities</li>
                        <li>Personalizing your experience</li>
                        <li>Sending you updates and important notifications</li>
                        <li>Analyzing usage patterns to enhance our platform</li>
                        <li>Complying with legal obligations</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      3. Information Sharing and Disclosure
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>With trusted service providers who assist us in operating our platform</li>
                        <li>When required by law or to protect our rights</li>
                        <li>In connection with a business transaction (merger, acquisition, etc.)</li>
                        <li>With your explicit consent</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      4. Data Security
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Encryption of data in transit and at rest</li>
                        <li>Regular security assessments and updates</li>
                        <li>Limited access to personal information on a need-to-know basis</li>
                        <li>Secure cloud infrastructure with industry-standard protections</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      5. Your Rights and Choices
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        Depending on your location, you may have certain rights regarding your personal information:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Access to your personal information</li>
                        <li>Correction of inaccurate or incomplete information</li>
                        <li>Deletion of your personal information</li>
                        <li>Restriction of processing</li>
                        <li>Data portability</li>
                        <li>Objection to processing</li>
                      </ul>
                      <p className="mt-4">
                        To exercise these rights, please contact us using the information provided below.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      6. Cookies and Tracking Technologies
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        We use cookies and similar tracking technologies to enhance your experience on our platform. You can manage your cookie preferences through your browser settings.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      7. Children's Privacy
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      8. Changes to This Policy
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                      </p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-white">
                      9. Contact Us
                    </h2>
                    <div className="space-y-4 text-foreground/80">
                      <p>
                        If you have any questions about this Privacy Policy or our data practices, please contact us at:
                      </p>
                      {websiteSettings?.contact_email && (
                        <p className="font-medium">
                          Email: <a href={`mailto:${websiteSettings.contact_email}`} className="text-brand-green hover:underline">
                            {websiteSettings.contact_email}
                          </a>
                        </p>
                      )}
                      <p>
                        We will respond to your inquiry within a reasonable timeframe.
                      </p>
                    </div>
                  </section>

                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;

import React from "react";
import {
  Headphones,
  FileText,
  Calendar,
  BarChartHorizontal,
  Mail,
  ShieldCheck,
  PanelLeft,
  Zap,
} from "lucide-react";

const Feature = ({ icon, title, description }) => {
  return (
    <div className="glass-panel rounded-xl p-6 hover:border-brand-green/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand-green/10 hover:-translate-y-1">
      <div className="w-14 h-14 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Headphones className="h-7 w-7" />,
      title: "Natural Voice Interaction",
      description:
        "AI voice agents that sound human, understand context, and maintain natural conversations with your customers.",
    },
    {
      icon: <Calendar className="h-7 w-7" />,
      title: "Appointment Scheduling",
      description:
        "Seamless integration with Cal.com allows agents to check availability and book appointments in real-time.",
    },
    {
      icon: <FileText className="h-7 w-7" />,
      title: "Bulk Outbound Calls",
      description:
        "Connect Google Sheets to run outbound call campaigns with detailed tracking and analytics.",
    },
    {
      icon: <BarChartHorizontal className="h-7 w-7" />,
      title: "Sentiment Analysis",
      description:
        "Understand customer emotions and satisfaction levels with advanced sentiment analysis on every call.",
    },
    {
      icon: <Mail className="h-7 w-7" />,
      title: "Call Summaries",
      description:
        "Receive detailed call summaries via email to stay in the loop without listening to every conversation.",
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: "White Label Service",
      description:
        "Resell AI voice agents under your own brand with a complete platform solution requiring zero setup.",
    },
    {
      icon: <PanelLeft className="h-7 w-7" />,
      title: "Comprehensive Dashboard",
      description:
        "Monitor all call activity, performance metrics, and agent statistics from a single intuitive dashboard.",
    },
    {
      icon: <Zap className="h-7 w-7" />,
      title: "Developer API",
      description:
        "Build custom applications and integrations with our robust API designed for developers.",
    },
  ];

  return (
    <section id="features" className="py-20 relative">
      {/* Gradient background */}
      <div className="absolute -z-10 inset-0 bg-gradient-to-b from-background via-background to-background/20" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Powerful Features for{" "}
            <span className="text-gradient">Modern Businesses</span>
          </h2>
          <p className="text-xl text-foreground/70">
            Enhance customer experience and streamline operations with our
            comprehensive suite of AI voice agent capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

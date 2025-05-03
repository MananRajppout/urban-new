import React from "react";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
      {/* Floating gradient orbs */}
      <div className="absolute -z-10 top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-green/20 blur-[100px] animate-pulse-slow" />
      <div className="absolute -z-10 bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-brand-green/10 blur-[120px] animate-pulse-slow animation-delay-1000" />

      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="max-w-4xl text-center">
          <h1 className="text-[28px] xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-1.5 mb-6 heading-container">
            <div>Transform Customer</div>
            <div>Engagement</div>
            <div className="text-gradient shimmer-effect whitespace-nowrap">
              with AI Voice Agents
            </div>
          </h1>

          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-foreground/80 mb-8 px-0 sm:px-2 md:px-6">
            Deploy intelligent voice agents that sound natural, understand
            context, and solve problems – without hiring a single human agent.
          </p>

          <div className="flex justify-center">
            <Link href="/signup" className="inline-block">
              <Button className="border-0 cursor-pointer bg-brand-green hover:bg-brand-green-dark text-black font-semibold text-xs xs:text-sm sm:text-base md:text-lg py-3 xs:py-4 md:py-6 px-4 xs:px-6 md:px-8 shadow-lg shadow-brand-green/20">
                <Headphones className="mr-2 h-4 w-4 xs:h-5 xs:w-5" /> Create
                Your AI Voice Agent Now
              </Button>
            </Link>
          </div>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
            <div className="flex -space-x-3 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background overflow-hidden bg-secondary"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${20 + i}`}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="ml-0 sm:ml-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/70">
                Trusted by 500+ businesses worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

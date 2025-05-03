import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, ArrowRight } from "lucide-react";

const FreePlanSection = ({ plan, onSelect }) => {
  return (
    <div className="glass-panel p-6 mb-10 border border-subtle-border rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="flex items-center mb-4">
            <div className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-xs font-medium mr-3">
              FREE
            </div>
            <h2 className="text-xl font-medium text-white">
              Start with our Free Plan
            </h2>
          </div>

          <p className="text-gray-300 mb-6">
            Our Free Plan is perfect for individuals and small teams who want to
            explore our platform before committing to a paid subscription.
          </p>

          <div className="p-4 bg-black/40 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Free Plan</h3>
              <span className="text-2xl font-bold text-white">$0</span>
            </div>

            <div className="bg-gray-800/30 h-px w-full mb-4"></div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-accent-teal/20 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-accent-teal" />
                </div>
                <span className="text-gray-300">
                  {plan.messages} message credits/month
                </span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-accent-teal/20 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-accent-teal" />
                </div>
                <span className="text-gray-300">{plan.chatbots} chatbot</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-accent-teal/20 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-accent-teal" />
                </div>
                <span className="text-gray-300">
                  {plan.characters} characters per chatbot
                </span>
              </li>
            </ul>

            <Button
              onClick={onSelect}
              className="w-full bg-gradient-to-r from-accent-teal to-accent-teal/80 text-black hover:from-accent-teal/90 hover:to-accent-teal/70"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h3 className="text-sm font-medium text-white mb-4 border-b border-gray-800 pb-2">
            Free Plan Features:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-accent-teal/20 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                  <Check className="w-3 h-3 text-accent-teal" />
                </div>
                <div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              </div>
            ))}
          </div>

          {plan.comingSoon.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-white mt-6 mb-4 border-b border-gray-800 pb-2">
                Coming Soon:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {plan.comingSoon.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-5 h-5 rounded-full bg-gray-500/20 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">{feature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 p-4 border border-accent-teal/20 rounded-lg bg-accent-teal/5">
            <p className="text-sm text-gray-300">
              <span className="text-accent-teal font-medium">Pro tip:</span> The
              Free Plan is great for exploring our platform, but if you need
              more features or message credits, consider upgrading to one of our
              paid plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreePlanSection;

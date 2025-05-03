import React from "react";
import Layout from "../layout/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PricingLayout = ({ children, activeTab, onTabChange }) => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-medium text-gradient">
            Subscription Plans
          </h1>
          <p className="text-gray-400 mt-2">
            Choose the right plan for your AI needs
          </p>
        </div>

        <Tabs
          defaultValue={activeTab}
          className="mb-10 w-full"
          onValueChange={onTabChange}
        >
          <TabsList className="grid grid-cols-2 mb-8 max-w-md mx-auto w-full">
            <TabsTrigger value="voice" className="text-sm md:text-base">
              AI Voice Agent
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="text-sm md:text-base">
              AI Chatbot
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </div>
    </Layout>
  );
};

export default PricingLayout;

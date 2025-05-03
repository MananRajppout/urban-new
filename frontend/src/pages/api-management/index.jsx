import Layout from "@/components/layout/Layout";
import React from "react";

const ApiManagement = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[300px] h-[calc(100vh-140px)]">
        <div className="glass-panel p-6 sm:p-10 rounded-lg text-center w-full max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Coming Soon
          </h1>
          <p className="text-gray-400">
            API Management functionality is currently under development and will
            be available soon.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ApiManagement;

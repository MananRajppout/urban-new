import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import useVoiceInfo from "@/hooks/useVoice";

const Layout = ({ children, className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  // const { isLoading, isVoiceAiActive } = useVoiceInfo();
  const [activeService, setActiveService] = useState("voice");

  // Close mobile menu when changing from mobile to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#121212] to-[#181824] text-foreground ${className}`}
    >
      {/* Regular sidebar for desktop */}
      {!isMobile && (
        <Sidebar
          activeService={activeService}
          onServiceChange={setActiveService}
        />
      )}

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 w-full md:ml-64 overflow-hidden">
        <Header>
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="mr-4 bg-transparent border border-none p-2 rounded-lg hover:bg-glass-panel-light/30 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          )}
        </Header>

        {/* Enhanced main content area with better spacing and responsive design */}
        <main className="px-3 py-4 md:p-5 lg:p-6 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-64px)] bg-gradient-to-br from-[#121212] to-[#181824] text-foreground antialiased">
          <div className="max-w-7xl mx-auto transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="animate-fade-in space-y-4 sm:space-y-5 lg:space-y-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

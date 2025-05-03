import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HomePageLayout({ children }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to conditionally allow the header
  function isAllowedHeader() {
    if (!isMounted) return false; // Prevent mismatches during server-side rendering

    // Exclude all paths under `/ai-assistant` or specific paths like `/chatbot-iframe/[id]`
    if (
      router.pathname.startsWith("/ai-assistant") ||
      router.pathname === "/chatbot-iframe/[id]"
    ) {
      return false;
    }

    return true;
  }

  // Function to conditionally allow the footer
  function isAllowedFooter() {
    if (
      router.pathname === "/chatbot-iframe/[id]" ||
      router.pathname.startsWith("/ai-assistant")
    ) {
      return false;
    }

    return true;
  }

  return (
    <>
      {isMounted && isAllowedHeader() && <Header />}
      {children}
      {isMounted && isAllowedFooter() && <Footer />}
    </>
  );
}

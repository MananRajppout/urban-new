import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogIn, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  initializeTelnyxClient,
  ensureValidToken,
} from "@/Utils/webCallHandler";
import { ProfileContext } from "@/pages/_app";
import { useRole } from "@/hooks/useRole";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isTokenExist, setIsTokenExist] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const router = useRouter();
  const { globalProfileData } = useContext(ProfileContext);
  const agentId = globalProfileData?.agentId;



  const checkForToken = () => {
    const token = localStorage.getItem("access_token");
    setIsTokenExist(!!token);
  };

  useEffect(() => {
    checkForToken();

    window.addEventListener("login", checkForToken);
    window.addEventListener("storage", checkForToken);
  
    window.addEventListener("signup",checkForToken)

    return () => {
      window.removeEventListener("login", checkForToken);
      window.removeEventListener("storage", checkForToken);
      window.removeEventListener("signup",checkForToken)
    };
  }, []);

  useEffect(() => {
    setActiveLink(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const checkValidToken = async () => {
        console.log("Checking valid token...");
        const validToken = await ensureValidToken(agentId);
        if (validToken) {
          console.log("Valid token found. Initializing Telnyx client...");
          await initializeTelnyxClient(validToken);
        }
      };
      checkValidToken();
    }
  }, [agentId]);

  const navItems = [
    { label: "Features", href: "/features" },
    { label: "Integrations", href: "/integrations" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, item) => {
    if (item.isScroll && router.pathname === "/") {
      e.preventDefault();
      const element = document.querySelector(item.href.replace("/", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    } else if (item.isScroll && router.pathname !== "/") {
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gradient">
          UrbanChat.ai
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() =>
                item.dropdown && setActiveDropdown(item.label)
              }
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={item.href}
                className={`no-underline text-sm font-medium ${
                  activeLink === item.href
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground"
                } transition-colors flex items-center`}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-4 w-4 ml-1" />}
              </Link>

              {/* Dropdown Menu */}
              {item.dropdown && activeDropdown === item.label && (
                <div className="absolute left-0 mt-2 glass-panel rounded-md p-2 min-w-[200px]">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className={`block text-sm px-4 py-2 rounded-md hover:bg-white/10 transition-colors ${
                        activeLink === subItem.href ? "text-primary" : ""
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTA Button - Conditionally render based on token existence */}
        <div className="hidden md:block">
          {isTokenExist ? (
            <Link href="/ai-voice-agent">
              <Button
                variant="outline"
                className={`border-brand-green cursor-pointer rounded-sm ${
                  activeLink === "/ai-voice-agent"
                    ? "text-primary"
                    : "text-brand-green"
                } hover:bg-brand-green/10 font-semibold`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button
                variant="outline"
                className={`border-brand-green cursor-pointer rounded-sm ${
                  activeLink === "/signin" ? "text-primary" : "text-brand-green"
                } hover:bg-brand-green/10 font-semibold`}
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign in / Sign up
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md bg-transparent border-0 cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div
            className={`relative w-6 h-5 transform transition-all duration-300`}
          >
            <span
              className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-2.5" : ""
              }`}
              style={{ top: "0" }}
            />
            <span
              className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
              style={{ top: "50%", transform: "translateY(-50%)" }}
            />
            <span
              className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
              }`}
              style={{ bottom: "0" }}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute w-full glass-panel shadow-xl transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 py-2 space-y-3">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className={`block py-2 text-sm font-medium ${
                  activeLink === item.href
                    ? "text-primary"
                    : "text-foreground/80 hover:text-foreground"
                }`}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </Link>

              {/* Mobile Dropdown Items */}
              {item.dropdown && (
                <div className="pl-4 border-l border-white/10 mt-1 space-y-2">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className={`block py-1 text-sm ${
                        activeLink === subItem.href
                          ? "text-primary"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Conditionally render mobile button based on token existence */}
          {isTokenExist ? (
            <Link href="/ai-voice-agent">
              <Button
                className={`w-full mt-4 border-brand-green ${
                  activeLink === "/ai-voice-agent"
                    ? "text-primary"
                    : "text-brand-green"
                } hover:bg-brand-green/10 font-semibold`}
                variant="outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/signin">
              <Button
                className={`w-full mt-4 border-brand-green ${
                  activeLink === "/signin" ? "text-primary" : "text-brand-green"
                } hover:bg-brand-green/10 font-semibold`}
                variant="outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign in / Sign up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

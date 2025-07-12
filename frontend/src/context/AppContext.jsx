import { getWebsiteSettings } from "@/lib/api/ApiSettings";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState({});
  const [websiteSettings, setWebsiteSettings] = useState({});
  const isFetchingWebsiteSettings = useRef(false);
  useEffect(() => {
    const fetchWebsiteSettings = async () => {
      try {
        const response = await getWebsiteSettings();
        setWebsiteSettings(response?.data?.settings);
      } catch (error) {
        console.log(error);
      }
    };
    if (!isFetchingWebsiteSettings.current) {
      isFetchingWebsiteSettings.current = true;
      fetchWebsiteSettings();
    }
  }, []);



  return (
    <AppContext.Provider value={{ state, setState, websiteSettings }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return { ...context, role: context.state.role };
};

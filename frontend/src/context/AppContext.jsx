import { getUserDetail } from "@/lib/api/ApiExtra";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [state, setState] = useState({});

  return (
    <AppContext.Provider value={{ state, setState }}>
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

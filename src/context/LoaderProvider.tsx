// src/context/LoaderContext.tsx
import React, { createContext, useContext, useState } from "react";
import SmartSkeletonLoader from "../components/common/SmartSkeletonLoader";

interface LoaderContextProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  variant?: "auto" | "page" | "card" | "table" | "dashboard";
  setVariant: (value: "auto" | "page" | "card" | "table" | "dashboard") => void;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"auto" | "page" | "card" | "table" | "dashboard">("auto");

  return (
    <LoaderContext.Provider value={{ loading, setLoading, variant, setVariant }}>
      {loading && <SmartSkeletonLoader variant={variant} />}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoaderProvider");
  }
  return context;
};

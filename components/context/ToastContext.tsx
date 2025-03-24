"use client"

import React, { createContext, useState, useContext } from "react";
import ToastMessage, { ToastType } from "@/components/ui/ToastMessage";

interface ToastContextType {
  success: (data: Omit<ToastType, "type">) => void;
  warning: (data: Omit<ToastType, "type">) => void;
  info: (data: Omit<ToastType, "type">) => void;
  error: (data: Omit<ToastType, "type">) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastData, setToastData] = useState<ToastType | undefined>();

  const showToast = (data: ToastType) => {
    setToastData(data);
  };

  const success = (data: Omit<ToastType, "type">) => showToast({ ...data, type: "success" });
  const warning = (data: Omit<ToastType, "type">) => showToast({ ...data, type: "warn" });
  const info = (data: Omit<ToastType, "type">) => showToast({ ...data, type: "info" });
  const error = (data: Omit<ToastType, "type">) => showToast({ ...data, type: "error" });

  return (
    <ToastContext.Provider value={{ success, warning, info, error }}>
      {toastData && <ToastMessage toastData={toastData} />}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

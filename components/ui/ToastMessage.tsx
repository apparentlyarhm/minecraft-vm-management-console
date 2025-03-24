import React, { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";

export type ToastType = {
  heading: string;
  message: string;
  type?: "success" | "info" | "warn" | "error";
  duration?: number;
};

const ToastMessage = ({ toastData }: { toastData?: ToastType }) => {
  const toastRef = useRef<Toast>(null);

  useEffect(() => {
    if (toastData && toastRef.current) {
      toastRef.current.show({
        severity: toastData.type || "info",
        summary: toastData.heading,
        detail: toastData.message,
        life: toastData.duration || 5000,
      });
    }
  }, [toastData]);

  return <Toast ref={toastRef} position="bottom-right" />;
};

export default ToastMessage;

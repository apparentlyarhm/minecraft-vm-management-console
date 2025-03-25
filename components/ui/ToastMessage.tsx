import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";

export type ToastType = {
  heading: string;
  message: string;
  type?: "success" | "info" | "warn" | "error";
  duration?: number;
};

const ToastMessage = ({ toastData }: { toastData?: ToastType }) => {
  const toastRef = useRef<Toast>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <Toast
      ref={toastRef}
      position={isMobile ? "top-center" : "bottom-right"}
      className={isMobile ? "p-toast-mobile" : ""}
    />
  );
};

export default ToastMessage;

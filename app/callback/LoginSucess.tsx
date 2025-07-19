"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { handleLoginCallback } from "@/lib/component-utils/loginUtils";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Logging in...");

  useEffect(() => {
    const tempCode = searchParams.get("code");

    if (!tempCode) {
      setMessage("Invalid access. Redirecting to login...");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
      return;
    }

    try {
      handleLoginCallback(tempCode)
      .then((res)=> {
        localStorage.setItem("app_token", res.token)
        localStorage.setItem("id", res.id)
      })

      const timeout = setTimeout(() => {
        router.replace("/");
      }, 1000);

      return () => clearTimeout(timeout);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      setMessage("Something went wrong. Redirecting to login...");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    }
  }, [router, searchParams]);

  return <LoadingSpinner message={message} />;
}

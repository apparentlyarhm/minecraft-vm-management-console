"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Logging in...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Invalid access. Redirecting to login...");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson);
      const sub: string = payload.sub || "";
      let id = "";
      if (sub.startsWith("github|")) {
        id = sub.split("|")[1] || "";
      }

      localStorage.setItem("app_token", token);
      if (id) {
        localStorage.setItem("id", id);
      }

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

"use client"

import { RotateCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            // Decode JWT payload
            const payloadBase64 = token.split(".")[1];
            try {
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

                // Add a 2 second delay before redirecting
                const timeout = setTimeout(() => {
                    router.replace("/");
                }, 1000);

                return () => clearTimeout(timeout);
            } catch (e) {
                console.error("Failed to decode JWT:", e);
                router.replace("/");
            }
        } else {
            console.error("No token found in URL, redirecting to login.");
            router.replace("/");
        }
    }, [router, searchParams]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center space-y-4">
                <RotateCw className="animate-spin text-4xl text-black" />
                <span className="text-black text-sm font-semibold font-ember">Logging in...</span>
            </div>
        </div>
    );
}
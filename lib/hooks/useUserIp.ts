// hooks/useUserIp.ts
import { useToast } from "@/components/context/ToastContext";
import { useEffect, useState } from "react";

export const useUserIp = () => {
  const [ip, setIp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  const { error } = useToast();

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIp(data.ip);
        setFetchFailed(false);
      } catch (e) {
        setFetchFailed(true);
        error({
          heading: "IP fetch failed",
          message: "Could not determine user IP",
          duration: 3000,
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchIP();
  }, []);

  return { ip, isFetching, fetchFailed };
};

import { useToast } from "@/components/context/ToastContext";
import { useEffect, useState } from "react";
import { fallbackVmDetails, fetchVmDetails } from "../component-utils/vmApiUtils";
import { checkIpInFirewall } from "../component-utils/firewallUtils";
import { isServerUp } from "../component-utils/pingUtils";

export const useVmInfo = (userIp: string | null) => {
  const [details, setDetails] = useState<Record<string, string | number>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [isIpPresent, setIsIpPresent] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const { error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);

      const serverIsUpFlag = await isServerUp();
      if (!serverIsUpFlag) {
        setDetails(fallbackVmDetails);
        error({
          heading: "Server Health Check failed",
          message: "Could not reach the info server. Using fallback values.",
          duration: 6000,
        });
        setFetchFailed(true);
        setIsFetching(false);
        return;
      }

      try {
        if (userIp != null) {
          const ipCheck = await checkIpInFirewall(userIp);
          setIsIpPresent(ipCheck.message === "PRESENT");
        }

        const vm = await fetchVmDetails();
        setDetails(vm);
      } catch (e: any) {
        console.error("Error fetching VM details:", e.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [userIp]);

  return {
    details,
    isFetching,
    isIpPresent,
    fetchFailed,
  };
};
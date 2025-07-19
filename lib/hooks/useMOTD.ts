// hooks/useMotd.ts
import { useEffect, useState } from "react";
import { fetchMotd } from "../component-utils/motdApiUtils";

export const useMotd = (publicIp: string | undefined) => {
  const [motd, setMotd] = useState<Record<string, string | number | string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicIp || publicIp === "N.A") return;

    setIsLoading(true);
    fetchMotd(publicIp)
      .then(setMotd)
      .catch((err) => console.error("MOTD fetch error:", err))
      .finally(() => setIsLoading(false));
  }, [publicIp]);

  return { motd, isLoading };
};

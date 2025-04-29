"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  GenericDetailsTab,
} from "@/components/ui/tabs";
import {
  CopyIcon,
  CircleCheck,
  CircleAlert,
  XCircle,
  GitPullRequestArrow,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import { tabs } from "@/lib/config/tabsConfig";
import { fetchVmDetails, vmAliases, fallbackVmDetails } from "@/lib/component-utils/vmApiUtils";
import { fetchMotd, MOTDAliases } from "@/lib/component-utils/motdApiUtils";
import { isServerUp } from "@/lib/component-utils/pingUtils";
import TopBar from "@/components/ui/topbar";

export default function VMDashboard() {

  // Message Center state vars
  const [message, setMessage] = useState<string | null>("Nothing to show!");
  const [isMessageCenterVisible, setIsMessageCenterVisible] = useState(false);

  // User IP state vars
  const [ip, setIp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  const [copied, setCopied] = useState(false);

  const { success, error, info } = useToast();

  // VM info state vars
  const [isVmInfoFetching, setIsVmInfoFetching] = useState(false);
  const [details, setDetails] = useState<Record<string, string | number>>({});

  // MOTD info state vars
  const [motdDetails, setMotdDetails] = useState<
    Record<string, string | number | string[]>
  >({});
  const [isMotdFetching, setIsMotdFetching] = useState(false);

  const VmName = isVmInfoFetching ? "fetching.." : details["Instance Name"];

  const handleIpAdd = async () => {
    info({
      heading: "Request sent",
      message: "IP will be added",
      duration: 2000,
    });

    setTimeout(() => {
      const isSuccess = Math.random() > 0.5; // 50% chance of success or failure

      if (isSuccess) {
        success({
          heading: "Success",
          message: "IP added successfully!",
          duration: 3000,
        });
      } else {
        error({
          heading: "Failed",
          message: "Failed to add IP. Please try again.",
          duration: 3000,
        });
      }
    }, 2500);
  };

  const handleIpCopy = async () => {
    try {
      console.log("inside copy");
      await navigator.clipboard.writeText(details["Public IP"] as string);
      success({
        heading: "Copied!",
        message: "Public IPv4 address copied to clipboard.",
        duration: 3000,
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      error({
        heading: "Copy Failed",
        message: "Could not copy the IP address. Please try again.",
        duration: 3000,
      });
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "RUNNING":
        return {
          variant: "success",
          bg: "bg-green-100 text-green-800",
          icon: CircleCheck,
        };
      case "PROVISIONING":
        return {
          variant: "success",
          bg: "bg-blue-100 text-blue-800",
          icon: CircleAlert,
        };
      default:
        return {
          variant: "success",
          bg: "bg-red-100 text-red-800",
          icon: XCircle,
        };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsVmInfoFetching(true);
    setIsMessageCenterVisible(true);
    setMessage("Checking API server availability...");

    const serverIsUp = await isServerUp();

    if (!serverIsUp) {
      setMessage("The API server appears to be unavailable. Using fallback values as the GCP free trial may have expired. The server Query will not be available until the API server is back up.");
      setDetails(fallbackVmDetails);
      setFetchFailed(true);
      setIsVmInfoFetching(false);
      return;
    }

    setMessage("API server is up. Fetching VM details...");

    try {
      const vmDetails = await fetchVmDetails();
      setDetails(vmDetails);
      setMessage("VM details fetched successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching VM details:", error.message);
      }
      setMessage("Failed to fetch VM details");
    } finally {
      setIsVmInfoFetching(false);
    }
  };

  useEffect(() => {
    if (!details["Public IP"] || details["Public IP"] === "N.A") return; // Ensure address exists and is not "NA" before calling fetchMotd. Its just a random fallback value.

    setIsMotdFetching(true);

    fetchMotd(details["Public IP"] as string)
        .then((motd) => setMotdDetails(motd))
        .catch((error) => console.error("Error fetching MOTD:", error))
        .finally(() => setIsMotdFetching(false));
  }, [details]);
  
  const {
    variant,
    bg,
    icon: Icon,
  } = getStatusStyles(details["Status"] as string);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setIp(data.ip);
        setFetchFailed(false); // Ensure failure flag is reset
      } catch (error) {
        console.error("Failed to fetch IP:", error);
        setMessage("Failed to fetch your IP address. Please try again later.");
        setFetchFailed(true);
      } finally {
        setIsFetching(false); // Always stop fetching
      }
    };

    fetchIP();
  }, []); // Runs only on mount

  return (
    <div className="min-h-screen bg-white">
      {/* Main content */}
        <TopBar items={
          [
          <a key="github-link" href="https://github.com/apparentlyarhm/minecraft-vm-management-console" target="_blank" rel="noopener noreferrer">
            <GitPullRequestArrow className="h-4 w-4" />
          </a>,
          <span key="instance-id">{details["Instance ID"]}</span>, 
          <span key="ip-address">{ip ? ip : "Fetching..."}</span>] // I am not really sure why key is needed here. the linter fails without it, but run dev works without it.
          } />
      <main className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-md md:text-2xl font-semibold">{VmName}</h1>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleIpAdd}
              disabled={isFetching || fetchFailed || isVmInfoFetching}
              className={`border-2 rounded-full ${
              isFetching || fetchFailed || isVmInfoFetching
                ? "border-gray-400"
                : "border-sky-600"
              }`}
            >
              <p
              className={`font-ember mx-4 font-semibold text-xs md:text-sm ${
                isFetching || fetchFailed || isVmInfoFetching
                ? "text-gray-400"
                : "text-sky-600"
              }`}
              >
              Whitelist: {ip}
              </p>
            </Button>

            <Button
              variant="outline"
              onClick={handleIpAdd}
              disabled={true}
              className="border-2 rounded-full border-gray-400"
            >
              <p className="font-ember text-gray-400 mx-4 font-semibold text-xs md:text-sm">
              Remove: {ip}
              </p>
            </Button>
          </div>
        </div>

        {/* Status card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Server summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isVmInfoFetching ? (
                <Spinner />
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className={`${bg} hover:${bg}`}>
                        <Icon className="w-4 h-4 mr-1 inline-block" />{" "}
                        {details["Status"]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Public IPv4 address
                    </h3>
                    <div className="flex gap-3">
                      <p>{details["Public IP"]}</p>
                      <Button
                        icon={CopyIcon}
                        size={"icon"}
                        onClick={handleIpCopy}
                        customSize="h-4 w-4"
                      ></Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Instance type
                    </h3>
                    <p>{details["Instance Type"]}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-7 w-full">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
          key={value}
          value={value}
          className="flex items-center gap-2"
              >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <GenericDetailsTab
            value="details"
            title="Instance Details"
            description="The instance details. This running however, does not guarantee that the server is up. Check MOTD."
            detailsMap={details}
            aliases={vmAliases}
            isLoading={isVmInfoFetching}
          />
          <GenericDetailsTab
            value="MOTD"
            title="Server Query"
            description="Query the server for information such as player count, server name, and more. This is a better indicator of server status than the instance status."
            help="The Minecraft Query Protocol is used to retrieve server information such as the Message of the Day (MOTD), player count, and other metadata. It operates over UDP and requires the server to have query enabled in the server.properties. Low level handshakes are used to establish a connection and retrieve data, and has to be written in a specific format. This is not the same as the RCON protocol, which is used for remote console access."
            detailsMap={motdDetails}
            aliases={MOTDAliases}
            isLoading={isMotdFetching}
          />
        </Tabs>
            {isMessageCenterVisible && (
            <div className="mt-6 rounded-xl border bg-card text-card-foreground p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight mb-10">
              Message Center
              </h3>
              <code className="block p-4 bg-gray-50 text-sm rounded-lg text-gray-800">
               {message}
              </code>
            </div>
            )}
      </main>
    </div>
  );
}

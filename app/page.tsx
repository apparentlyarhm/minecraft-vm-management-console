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
  ArrowDown,
  CircleAlertIcon
} from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import { tabs } from "@/lib/config/tabsConfig";
import { fetchVmDetails, vmAliases, fallbackVmDetails } from "@/lib/component-utils/vmApiUtils";
import { fetchModList, fetchMotd, MOTDAliases } from "@/lib/component-utils/motdApiUtils";
import { isServerUp } from "@/lib/component-utils/pingUtils";
import TopBar from "@/components/ui/topbar";
import { addIpToFirewall, checkIpInFirewall, purgeFirewall } from "@/lib/component-utils/firewallUtils";
import { initiateLogin } from "@/lib/component-utils/loginUtils";
import { ModList } from "@/components/ui/mod-list";

export default function VMDashboard() {

  const [isIpPresent, setIsIpPresent] = useState(false)

  // Mod List state vars
  const [modlist, setModList] = useState<string[]>([])
  const [updatedAt, setUpdateAt] = useState<string>("")
  const [modListFetchFailed, setModListFetchFailed] = useState(false)
  const [modListFetching, setModListFetching] = useState(false)

  // logged in user
  const [loggedInUser, setLoggedInUser] = useState<string>("Not Logged in")

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

    if (ip != null) {
      addIpToFirewall({ address: ip, passcode: "test" })
        .then((message) => {
          success({
            heading: "Done!",
            message: "IP whitelisted successfully",
            duration: 3000,
          });
          setIsIpPresent(true);
        })
        .catch((e) =>
          error({
            heading: "Something went wrong",
            message: `${e}`,
            duration: 3000,
          })
        );

    };
  }
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

  const fetchMods = async () => {
    setModListFetching(true)

    fetchModList()
    .then(res => {
      setModList(res.mods)
      setUpdateAt(res.updatedAt)
    })
    .catch(e => {
      error({
          heading: "Failed to fetch Mod list",
          message: `${e}`,
          duration: 6000,
        })
        setModListFetching(false)
    })
    .finally(() => setModListFetching(false))
  }

  const handlePurge = async () => {
    const token = localStorage.getItem("app_token");

    if (!token) {
      console.log("No token found. Initiating login.");
      await initiateLogin();
      return;
    }

    try {
      console.log("Token found. Attempting to purge firewall.");

      purgeFirewall(token)
        .then((message) => success({
          heading: "Purged",
          message: "All whitelisted IPs cleared!",
          duration: 3000,
        }
        ))
        .catch((err) => error({
          heading: "Failed to purge",
          message: `${err}`,
          duration: 6000,
        }))

    } catch (e) {
      const err = e as Error;
      if (!err.message.includes('Unauthorized')) {
      }
    } finally {
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
  const run = async () => {
    await fetchData();
    await fetchMods();
  };
  run();
}, []);

  const fetchData = async () => {
    setIsVmInfoFetching(true);
    console.log("inside vm fetch data")
    const serverIsUp = await isServerUp();

    if (!serverIsUp) {
      setDetails(fallbackVmDetails);
      error({
        heading: "Server Health Check failed",
        message: "The information server could not be reached. It is possible that the service is unavailable. Values are fallback here and most features are disabled.",
        duration: 6000,
      });

      setFetchFailed(true);
      setIsVmInfoFetching(false);
      return;
    }


    try {
      const vmDetails = await fetchVmDetails();
      setDetails(vmDetails);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching VM details:", error.message);
      }
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

  const { variant, bg, icon: Icon, } = getStatusStyles(details["Status"] as string);

  useEffect(() => {
    const fetchAndCheckIP = async () => {
      console.log("fetch ip");
      try {
        const user = localStorage.getItem("id")
        const token = localStorage.getItem("app_token")

        if (user && token && user != "" && token != "") {
          setLoggedInUser(user)
        }

        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();

        setIp(data.ip); // For UI
        setFetchFailed(false);

        // Now check firewall status with the fetched IP directly
        const result = await checkIpInFirewall(data.ip);
        if (result.message === "PRESENT") {
          setIsIpPresent(true);

        } else {
          setIsIpPresent(false);
          info({
            heading: "IP isn't whitelisted",
            message: "You wont be able to connect to the server or see MOTD unless you whitelist yourself!",
            duration: 3000,
          })
        }
      } catch (e) {
        error({
          heading: "IP fetch failed",
          message: "Could not determine user IP",
          duration: 3000,
        });
        setFetchFailed(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAndCheckIP();
  }, []);


  return (
    <div className="min-h-screen bg-white">
      {/* Main content */}
      <TopBar items={
        [
          <a key="github-link" href="https://github.com/apparentlyarhm/minecraft-vm-management-console" target="_blank" rel="noopener noreferrer">
            <GitPullRequestArrow className="h-4 w-4" />
          </a>,
          <span key="instance-id">{details["Instance ID"]}</span>,
          <span key="ip-address">{ip ? ip : "Fetching..."}</span>,
          <span key="user">{loggedInUser}</span>
        ] // I am not really sure why key is needed here. the linter fails without it, but run dev works without it.
      } />
      <main className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex-1">
            <h1 className="text-md md:text-2xl font-semibold">{VmName}</h1>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleIpAdd}
              disabled={isFetching || fetchFailed || isVmInfoFetching || isIpPresent}
              className={`border-2 rounded-full ${isFetching || fetchFailed || isVmInfoFetching
                ? "border-gray-400"
                : "border-sky-600"
                }`}
            >
              <p
                className={`font-ember mx-4 font-semibold text-xs md:text-sm ${isFetching || fetchFailed || isVmInfoFetching
                  ? "text-gray-400"
                  : "text-sky-600"
                  }`}
              >
                Whitelist: {ip}
              </p>
            </Button>
            <Button
              variant="outline"
              onClick={handlePurge}
              className={`border-2 rounded-full hover:bg-red-50 border-red-500`}
            >
              <p
                className={`font-ember text-red-500 mx-4 font-semibold text-xs md:text-sm`}
              >
                Purge Firewall
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
                      Whitelisting status
                    </h3>
                    {isIpPresent ? (
                      <div className="flex items-center gap-2">
                        <CircleCheck className="text-green-700 w-5 h-5" />
                        <span className="text-green-800 text-sm italic">Your IP is whitelisted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CircleAlert className="text-blue-700 w-5 h-5" />
                        <span className="text-blue-800 text-sm italic">Your IP is not whitelisted</span>
                      </div>
                    )}
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
                className="flex items-center cursor-pointer gap-2"
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
          <ModList
            value="modlist"
            updatedAt = {updatedAt}
            title="Mod List"
            description="The below list shows all current installed mods. Downloads are not supported yet."
            items={modlist}
            isLoading={false}
          />
        </Tabs>
      </main>
    </div>
  );
}
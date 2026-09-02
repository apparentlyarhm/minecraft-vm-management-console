"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  ShieldCheck,
  Loader,
  Trash2,
  RotateCcw,
  LogOutIcon,
  LogInIcon,
} from "lucide-react";
import { useToast } from "@/components/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import { tabs } from "@/lib/config/tabsConfig";
import { fetchVmDetails, vmAliases } from "@/lib/component-utils/vmApiUtils";
import { fetchMotd, MOTDAliases } from "@/lib/component-utils/motdApiUtils";
import TopBar from "@/components/ui/topbar";
import { addIpToFirewall, checkIpInFirewall } from "@/lib/component-utils/firewallUtils";
import { initiateLogin } from "@/lib/component-utils/loginUtils";
import { ModList } from "@/components/ui/mod-list";
import { useFallbackMode } from "@/lib/AppWrapper";
import FallbackBanner from "@/components/ui/fallback-card";
import AdminComponent from "@/components/ui/admin/main";
import StillLoadingCard from "@/components/ui/still-loading-card";
import LogComponent from "@/components/ui/logs/main";
import PerformanceGraphs from "@/components/ui/performance/main";
import PerformanceGraphsTab from "@/components/ui/performance-graphs/main";

export default function VMDashboard() {

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const isFallback = useFallbackMode();
  const [isIpPresent, setIsIpPresent] = useState(false)

  // button states
  const [isWhitelisting, setIsWhitelisting] = useState(false);


  // Mod List state vars
  const [modListFetching, setModListFetching] = useState(false)

  // logged in user
  const [loggedInUser, setLoggedInUser] = useState<string>("Anonymous")

  // boolean for slow loading notice
  const [showSlowLoadingNotice, setShowSlowLoadingNotice] = useState(false);

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
  const [activeTab, setActiveTab] = useState("MOTD");

  const VmName = isVmInfoFetching ? "fetching.." : details["Instance Name"];

  // actual server status
  const [svrStatString, setSvrStatString] = useState<string>("UNAVAILABLE")
  const [svrStatBool, setSvrStatBool] = useState<boolean>(false)

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
  const { variant, bg, icon: Icon, } = getStatusStyles(details["Status"] as string);

  const handleIpAdd = async () => {
    const token = localStorage.getItem("app_token");

    if (!token) {
      error({
        heading: "Login required",
        message: "Please login again to whitelist your IP",
        duration: 3000,
      });
      return;
    }

    setIsWhitelisting(true);

    if (ip != null) {
      addIpToFirewall(token, { address: ip, passcode: "test" })
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
        )
        .finally(() => {
          setIsWhitelisting(false);
        })

    };
  }
  const handleIpCopy = async () => {
    try {
      await navigator.clipboard.writeText(details["Public IP"] as string);

      success({
        heading: "Copied!",
        message: "Server address copied to clipboard.",
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

  const fetchData = async () => {
    setIsVmInfoFetching(true);

    // same explanation for this return here.
    return fetchVmDetails(isFallback)
      .then(res => {
        setDetails(res);
      })
      .catch(e => {
        error({
          heading: "Failed to fetch VM details",
          message: `${e}`,
          duration: 6000,
        })
        setIsVmInfoFetching(false)
      })
      .finally(() => { setIsVmInfoFetching(false); console.log("fetched vm details") });
  };

  useEffect(() => {
    setSvrStatString("Checking...")

    if (isFallback) {
      setSvrStatString("UNAVAILABLE")
      return
    }

    // TODO: improve
    if (motdDetails && motdDetails["Message of the day"] !== "Fallback Server" && motdDetails["Message of the day"] !== "") {
      // fallback data also comes in case of server actually being down
      setSvrStatString(`AVAILABLE, w = ${motdDetails["World Name"]}; p = ${motdDetails["Number of players online"]}/${motdDetails["Max Players"]}`)
    }
    else {
      setSvrStatString("UNAVAILABLE")
    }

    return
  }, [isFallback, motdDetails])

  const initializeServerData = async () => {
    const slowTimeout = setTimeout(() => {
      setShowSlowLoadingNotice(true) // shows a card
    }, 4500); // after 4.5s, if not cancelled

    // these are independent api calls
    Promise.all([
      fetchData(), // -> data
    ])
      .finally(() => {

        clearTimeout(slowTimeout) // clear if queued up
        setShowSlowLoadingNotice(false) // removes the aformentioned card, if present.
      })
  };

  useEffect(() => {
    setIsMotdFetching(true);
    const ip = details["Public IP"] as string;

    if (!ip) return;

    fetchMotd(ip, isFallback)
      .then((motd) => setMotdDetails(motd))
      .catch((error) => console.error("Error fetching MOTD:", error))
      .finally(() => setIsMotdFetching(false));

  }, [details?.["Public IP"]]);

  useEffect(() => {
    // so it turns out that since both of these are async, the api calls to fetch machine data happens first.
    // i think we can time that to determine if we show the slow loading card or not

    fetchAndCheckIP(); // ip is fetched and checked
    initializeServerData(); // vm data is fetched
  }, []);

  // we need a separate function for checking ip status so that it can be re-checked on demand
  const checkIpStatus = async () => {
    if (ip == null) {
      error({
        heading: "Failed to check IP status",
        message: "Cannot determine user IP, try reloading",
        duration: 3000,
      });

      return
    };

    info({
      heading: "Checking...",
      message: "Verifying IP whitelisting status",
      duration: 2000,
    });

    try {
      const result = await checkIpInFirewall(ip, isFallback);
      if (result.message === "PRESENT") {
        setIsIpPresent(true);

      } else {
        setIsIpPresent(false);
      }
      success({
        heading: "Done!",
        message: `Your IP is ${result.message.toLowerCase()}`,
        duration: 3000,
      });


    } catch (e) {
      error({
        heading: "Failed to check IP status",
        message: "Could not verify if IP is whitelisted",
        duration: 3000,
      });
    }
  }

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
      const result = await checkIpInFirewall(data.ip, isFallback);
      if (result.message === "PRESENT") {
        setIsIpPresent(true);

      } else {
        setIsIpPresent(false);
        info({
          heading: "IP isn't whitelisted",
          message: "You wont be able to connect to the server unless you whitelist yourself!",
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

  const logout = () => {
    // there is no point making this hard. ANON users cant really do anything sensitive anyway

    localStorage.removeItem("app_token");
    localStorage.removeItem("id");
    window.location.reload();

    setLoggedInUser("Anonymous")
  }

  const login = async () => {
    await initiateLogin();
  }

  if (isMobile) {
    return (
      <div className={`flex bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url(/minecraft-cat.gif)] bg-no-repeat bg-cover flex-col p-2 gap-2 min-h-screen items-center justify-center`}>
        {/* temporary image */}

        {/* TODO: add login */}
        <p className="text-sm text-white font-bold">{`Hiii ${loggedInUser}! Welcome to bastion.arhm.dev!`}</p>

        <br></br>

        <Button
          variant="default"
          onClick={handleIpAdd}
          disabled={
            isFetching ||
            fetchFailed ||
            isVmInfoFetching ||
            isIpPresent ||
            isWhitelisting ||
            isFallback
          }
          className={`
    w-full h-auto
    p-0
    rounded-2xl
    border-2
    transition-all
    hover:scale-[1.01]
    active:scale-[0.99]
    ${isFetching || fetchFailed || isVmInfoFetching
              ? "border-gray-300"
              : isFallback
                ? "border-red-400"
                : "border-sky-500"
            }
  `}
        >
          <div className="w-full p-5 text-left bg-white rounded-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Instance
                </p>

                <h1 className="text-lg font-bold text-gray-900">
                  {VmName}
                </h1>
              </div>

              {isWhitelisting ? (
                <Loader className="animate-spin h-5 w-5 text-sky-600 shrink-0" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0" />
              )}
            </div>

            {/* Divider */}
            <div className="my-4 border-t" />

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  Public IP
                </p>
                <p className="font-medium text-gray-800 break-all">
                  {details["Public IP"]}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  VM Status
                </p>

                <p className="font-medium text-gray-800">
                  {details["Status"]}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  Server Status
                </p>

                <p className="font-medium text-gray-800">
                  {svrStatString}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  Your IP
                </p>

                <p className="font-medium text-gray-800 break-all">
                  {ip}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">
                  Note
                </p>
                <p className="text-gray-600 justify-start">Most of the desktop features of this dashboard are in development for mobile devices. In the meantime, you can, whitelist yourself, and view basic stuff.</p>
              </div>

            </div>

            {/* CTA */}
            <div className="mt-5">
              <div
                className={`
          w-full rounded-xl px-4 py-3
          text-center font-semibold text-sm
          transition-colors
          ${isFallback
                    ? "bg-red-100 text-red-700"
                    : isIpPresent
                      ? "bg-green-100 text-green-700"
                      : "bg-sky-100 text-sky-700"
                  }
        `}
              >
                {isFallback
                  ? "Fallback mode: Can't whitelist!"
                  : isIpPresent
                    ? "Your IP is already whitelisted"
                    : "Tap to whitelist and start playing"}
              </div>
            </div>
          </div>
        </Button>

        <FallbackBanner />

        {showSlowLoadingNotice && <StillLoadingCard />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">

      <TopBar
        items={[
          {
            label: 'USER IP',
            content: <span>{ip ? ip : 'Fetching...'}</span>,
          },
          {
            label: 'STATUS',
            content: isVmInfoFetching ? (
              <Spinner />
            ) : (
              <Badge variant="success" className={`${bg} hover:${bg}`}>
                <Icon className="w-4 h-4 mr-1 inline-block" />
                {details['Status']}
              </Badge>
            ),
          },
          {
            label: 'PUBLIC IP',
            content: isVmInfoFetching ? (
              <Spinner />
            ) : (
              <div className="flex flex-row items-center gap-1">
                <p className="text-sm">{details['Public IP']}</p>
                <CopyIcon
                  className="w-8 h-8 hover:bg-gray-200 hover:text-black rounded-xl p-2 cursor-pointer"
                  onClick={handleIpCopy}
                />
              </div>
            ),
          },
          {
            label: 'ACCESS',
            content: isVmInfoFetching ? (
              <Spinner />
            ) : (
              <div className="flex flex-row gap-1 items-center">
                {isIpPresent ? (
                  <>
                    <CircleCheck className="text-green-400 w-5 h-5" />
                    <span className="text-green-400 text-sm italic">Granted</span>
                  </>
                ) : (
                  <>
                    <CircleAlert className="text-blue-400 w-5 h-5" />
                    <span className="text-blue-400 text-sm italic">Not granted</span>
                  </>
                )}
                <RotateCcw
                  className="w-8 h-8 hover:bg-gray-200 hover:text-black rounded-xl p-2 cursor-pointer"
                  onClick={checkIpStatus}
                />
              </div>
            ),
          },
          {
            label: 'USER',
            content: (
              <div className="flex flex-row items-center gap-1">
                <p>{loggedInUser}</p>
                {loggedInUser === 'Anonymous' ? (
                  <LogInIcon
                    className="h-8 w-8 p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer"
                    onClick={login}
                  />
                ) : (
                  <LogOutIcon
                    className="h-8 w-8 p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer"
                    onClick={logout}
                  />
                )}
              </div>
            ),
          },
        ]}
      />

      <main className="flex-grow p-6">

        {isFallback && (<FallbackBanner />)}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">

          <div className="flex-1">
            <h1 className="text-md md:text-2xl font-semibold">{VmName}</h1>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleIpAdd}
              disabled={isFetching || fetchFailed || isVmInfoFetching || isIpPresent || isWhitelisting || isFallback}
              className={`border-2 rounded-full ${isFetching || fetchFailed || isVmInfoFetching
                ? "border-gray-400"
                : "border-sky-600"
                }`}
            >
              {isWhitelisting ? (
                <Loader className="animate-spin h-4 w-4 mx-4 text-sky-600" />
              ) : (
                <p
                  className={`flex items-center gap-2 font-ember mx-4 font-semibold text-xs md:text-sm ${isFetching || fetchFailed || isVmInfoFetching
                    ? "text-gray-400"
                    : "text-sky-600"
                    }`}
                >
                  Whitelist: {ip}
                  <ShieldCheck className="w-4 h-4" />
                </p>
              )}
            </Button>
          </div>

        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            isFallback={isFallback}
            value="modlist"
            title={isFallback ? "Mod List (sample)" : "Mod List"}
            description="The below list shows all current installed mods. Click to download."
            help="A server mod can enchance a server's function or add features. Many mods in minecraft need to be present on both clients and servers to function correctly. Using this tab, you can download any missing mods."
          />
          <AdminComponent
            address={details["Public IP"] as string}
            isFallback={isFallback}
            value="admin-controls"
            title="Admin Commands"
            description="Various admin commands that involve minecraft RCON protocol, as well as general server access management."
            help="Remote Console (RCON) is a protocol that allows server administrators to remotely execute commands on the Minecraft server. It requires RCON to be enabled in the server.properties file, along with a secure password. Once configured, you can send commands to the server as if you were typing them directly into the server console. This is useful for managing the server without needing direct access to the host machine. Commands other than RCON one do not interact with the Minecraft server directly, but rather with the VM hosting it."
            players={motdDetails["Online players"] as string[] || []}
            isLoading={modListFetching}
          />
          <LogComponent
            value="logs"
            title="View logs"
            description="View the logs that server the produces. reads /logs/latest.log."
            isFallback={isFallback}
            help="The minecraft latest.log file is a text file in your Minecraft folder that records game events, errors, and activity. Good for troubleshooting."
            address={details['Public IP'] ? details['Public IP'] as string : undefined}
          />
          <PerformanceGraphs
            address={details['Public IP'] ? details['Public IP'] as string : undefined}
            isFallback={isFallback}
            isActive={activeTab === "performance"}
            value="performance"
            title="Performance State"
            description="Overview of server performance metrics. (Opacity flickering is added deliberately to signify periodic updates"
            help="A simple snapshot of how currently the metrics across the server looks like. Each metric has a simple explanation."
          />
          
          <PerformanceGraphsTab
            address={details['Public IP'] ? details['Public IP'] as string : undefined}
            isFallback={isFallback}
            isActive={activeTab === "performance-graphs"}
            value="performance-graphs"
            title="Performance Graphs"
            description="Detailed performance graphs of the server metrics over time."
            help="These graphs provide a visual representation of various server performance metrics, helping you to analyze trends and identify potential issues."
          />

          {showSlowLoadingNotice && <StillLoadingCard />}
        </Tabs>
      </main>

    </div>
  );
}
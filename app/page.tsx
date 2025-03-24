"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, BrickWall, Globe, CloudUpload, Github, CopyIcon, Monitor } from "lucide-react"
import { useToast } from "@/components/context/ToastContext";
import {Spinner} from "@heroui/spinner";
import { tr } from "framer-motion/client";

export default function VMDashboard() {
  const [ip, setIp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
const [fetchFailed, setFetchFailed] = useState(false);

  const [copied, setCopied] = useState(false);

  const { success, error, info } = useToast(); 
  
  const[isVmInfoFetching, setIsVmInfoFetching] = useState(false);

  const handleIpAdd = async () => {
    success({
      heading: "Request sent",
      message: "IP will be added",
      duration: 2000,
    })
  }

  const handleIpCopy = async () => {
  
    try {
      console.log("inside copy")
      await navigator.clipboard.writeText(vmData.publicIp);
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

  const vmData = {
    instanceName: "munecraft",
    machineType: "c2d-standard-4",
    instanceId: "2146535245022333325",
    status: "RUNNING",
    creationTimestamp: "2025-03-02T02:48:07.767-08:00",
    publicIp: "34.143.138.93",
    cpuPlatform: "AMD Milan",
    cpuCores: 4,
    memoryMb: 16384,
    maxPersistentDisksGb: 263168,
    // Additional suggested fields
    instanceType: "e2-standard-4",
    region: "us-west1-b",
    operatingSystem: "Linux",
    networkInterfaces: [
      {
        networkName: "default",
        subnetwork: "default",
        privateIp: "10.128.0.12",
        publicIp: "34.143.138.93",
      },
    ],
    disks: [
      {
        name: "munecraft-boot-disk",
        type: "SSD persistent disk",
        sizeGb: 50,
        bootDisk: true,
      },
      {
        name: "munecraft-data-disk",
        type: "Standard persistent disk",
        sizeGb: 500,
        bootDisk: false,
      },
    ],
    tags: ["game-server", "minecraft", "production"],
    securityGroups: ["default", "allow-minecraft"],
  }

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
        setFetchFailed(true);
      } finally {
        setIsFetching(false); // Always stop fetching
      }
    };
  
    fetchIP();
  }, []); // Runs only on mount
  
  const creationDate = new Date(vmData.creationTimestamp)
  const formattedDate = creationDate.toLocaleString()

  const memoryGb = vmData.memoryMb / 1024
  const maxStorageGb = vmData.maxPersistentDisksGb / 1024 / 1024

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* Main content */}
      <main className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{vmData.instanceName}</h1>
            <p className="text-sm text-muted-foreground">Instance ID: {vmData.instanceId}</p>
            <p className="text-sm text-muted-foreground">Your IPv4 address: {ip ? ip : "Fetching..."}</p>

          </div>
          <Button size={"icon"} icon={Github} variant={"default"}></Button>
        </div>

        {/* Status card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Server summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={vmData.status === "RUNNING" ? "success" : "destructive"}
                    className="bg-green-100 text-green-800 hover:bg-green-100"
                  >
                    {vmData.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Public IPv4 address</h3>
                <div className="flex gap-3">
                <p>{vmData.publicIp}</p>
                <Button icon={CopyIcon} size={"icon"} onClick={handleIpCopy} customSize="h-5 w-5"></Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance type</h3>
                <p>{vmData.machineType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details">

          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="MOTD" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">MOTD</span>
            </TabsTrigger>
            <TabsTrigger value="firewall" className="flex items-center gap-1">
              <BrickWall className="h-4 w-4" />
              <span className="hidden sm:inline">Firewall</span>
            </TabsTrigger>
          </TabsList>

          {/* Details tab content */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <Card className="min-h-[400px]">
              
              <CardHeader>
                <CardTitle>Instance details</CardTitle>
                <CardDescription>Detailed information about this instance</CardDescription>
              </CardHeader>
              <CardContent>
              {isVmInfoFetching ? (
               
               <div role="status">
                   <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                       <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                   </svg>
                   <span className="sr-only">Loading...</span>
               </div>
               
                             ) : ( 
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance ID</h3>
                                  <p>{vmData.instanceId}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance name</h3>
                                  <p>{vmData.instanceName}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance type</h3>
                                  <p>{vmData.machineType}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Availability zone</h3>
                                  <p>{vmData.region}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Launch time</h3>
                                  <p>{formattedDate}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Platform</h3>
                                  <p>{vmData.cpuPlatform}</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">vCPU</h3>
                                  <p>{vmData.cpuCores} cores</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Memory</h3>
                                  <p>{memoryGb} GB</p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Used storage</h3>
                                  <p>{maxStorageGb.toFixed(2)} GB</p>
                                </div>
                              </div>
                            </div>
                             )}
                
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
        <div className="mt-6">
            <>
    {fetchFailed && (
      <p className="text-red-500 text-sm">
        Failed to fetch IP. Please reload the page.
      </p>
    )}
    <Button
      variant="outline"
      onClick={handleIpAdd}
      size="lg"
      icon={CloudUpload}
      iconPosition="right"
      disabled={isFetching || fetchFailed || isVmInfoFetching} // ✅ Disabled while fetching or if failed
    >
      <p className="font-ember">Add your IP</p>
    </Button>
  </>
            </div>
      </main>
    </div>
  )
}


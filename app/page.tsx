"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, BrickWall, Globe, CloudUpload, Github, CopyIcon, Monitor, CircleCheck, CircleAlert, XCircle } from "lucide-react"
import { useToast } from "@/components/context/ToastContext";
import Spinner from "@/components/ui/Spinner";
import {tabs} from "../lib/config/tabsConfig"; 
import { details } from "../lib/config/tabs/details";
import { tr } from "framer-motion/client";

export default function VMDashboard() {
  const [ip, setIp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
const [fetchFailed, setFetchFailed] = useState(false);

  const [copied, setCopied] = useState(false);

  const { success, error, info } = useToast(); 
  
  const[isVmInfoFetching, setIsVmInfoFetching] = useState(false);

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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "RUNNING":
        return { variant: "success", bg: "bg-green-100 text-green-800", icon: CircleCheck };
      case "PROVISIONING":
        return { variant: "success", bg: "bg-blue-100 text-blue-800", icon: CircleAlert };
      default:
        return { variant: "success", bg: "bg-red-100 text-red-800", icon: XCircle };
    }
  };

  const vmData = {
    instanceName: "munecraft",
    machineType: "c2d-standard-4",
    instanceId: "2146535245022333325",
    region: "asia-southeast1-b",
    status: "PROVISIONING",
    creationTimestamp: "2025-03-02T02:48:07.767-08:00",
    publicIp: "34.143.138.93",
    cpuPlatform: "AMD Milan",
    cpuCores: 4,
    memoryMb: 16384,
    diskMb: 10000,
  }

  const { variant, bg, icon: Icon } = getStatusStyles(vmData.status);
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
  const diskGb = vmData.diskMb / 1024 

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
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className={`${bg} hover:${bg}`}>
                    <Icon className="w-4 h-4 mr-1 inline-block" /> {vmData.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Public IPv4 address</h3>
                <div className="flex gap-3">
                <p>{vmData.publicIp}</p>
                <Button icon={CopyIcon} size={"icon"} onClick={handleIpCopy} customSize="h-4 w-4"></Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance type</h3>
                <p>{vmData.machineType}</p>
              </div>
              </>
          )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details">

          <TabsList className="grid grid-cols-7 w-full">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
      ))}
          </TabsList>

          {/* Details tab content */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <Card className="min-h-[400px]">
              
              <CardHeader>
                <CardTitle>{details.cardTitle}</CardTitle>
                <CardDescription>{details.cardDescription}</CardDescription>
              </CardHeader>
              <CardContent>
              {isVmInfoFetching ? (
                  <Spinner />
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
                                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Disk Size</h3>
                                  <p>{diskGb} GB</p>
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
      <p className="text-red-400 text-sm mt-4">
        Failed to fetch IP. Please reload the page.
      </p>
    )}
  </>
            </div>
      </main>
    </div>
  )
}


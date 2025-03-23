"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info } from "lucide-react"

export default function VMDashboard() {
  const [ip, setIp] = useState<string | null>(null);

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
    fetchIP();
  })

  const fetchIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIp(data.ip); // Extract and store the IP address
    } catch (error) {
      console.error("Failed to fetch IP:", error);
    }
  };
  // Format creation date
  const creationDate = new Date(vmData.creationTimestamp)
  const formattedDate = creationDate.toLocaleString()

  // Convert memory from MB to GB for display
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
            <p className="text-sm text-muted-foreground">Your IPV4 address: {ip ? ip : "Fetching..."}</p>

          </div>
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
                <p>{vmData.publicIp}</p>
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
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
          </TabsList>

          {/* Details tab content */}
          <TabsContent value="details" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Instance details</CardTitle>
                <CardDescription>Detailed information about this instance</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
            <div>
              <Button variant={"outline"} size={"lg"}>
                <p className="font-ember">Add your IP</p>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


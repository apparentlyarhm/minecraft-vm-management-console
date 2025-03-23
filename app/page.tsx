import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info } from "lucide-react"

export default function VMDashboard() {
  // Sample VM data - this would come from your API
  const vmData = {
    instanceName: "munecraft",
    status: "RUNNING",
    creationTimestamp: "2025-03-02T02:48:07.767-08:00",
    publicIp: "34.143.138.93",
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

  // Format creation date
  const creationDate = new Date(vmData.creationTimestamp)
  const formattedDate = creationDate.toLocaleString()

  // Convert memory from MB to GB for display
  const memoryGb = vmData.memoryMb / 1024
  const maxStorageTb = vmData.maxPersistentDisksGb / 1024

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* Main content */}
      <main className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{vmData.instanceName}</h1>
            <p className="text-sm text-muted-foreground">Instance ID: i-0123456789abcdef0</p>
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
                <p>{vmData.instanceType}</p>
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
                      <p>i-0123456789abcdef0</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance name</h3>
                      <p>{vmData.instanceName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Instance type</h3>
                      <p>{vmData.instanceType}</p>
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
                      <p>{vmData.operatingSystem}</p>
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
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Max storage capacity</h3>
                      <p>{maxStorageTb.toFixed(2)} TB</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status checks</h3>
                      <p className="text-green-600">2/2 checks passed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}


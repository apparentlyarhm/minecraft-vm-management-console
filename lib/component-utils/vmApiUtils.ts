import API_ENDPOINTS from "../config/endpointConfig";

export type VmDetailsResponse = {
  instanceName: string;
  instanceZone: string;
  machineType: string;
  instanceId: string;
  status: string;
  creationTimestamp: string;
  publicIp: string;
  cpuPlatform: string;
  cpuCores: number;
  memoryMb: number;
  diskGb: number;
};
// We will ignore the meta-data for now

export const vmAliases: Record<string, string> = {
  instanceId: "Instance ID",
  instanceName: "Instance Name",
  machineType: "Instance Type",
  instanceZone: "Availability Zone",
  status: "Status",
  publicIp: "Public IP",
  creationTimestamp: "Launch Time",
  cpuPlatform: "Platform",
  cpuCores: "vCPU",
  memoryMb: "Memory (MB)",
  diskGb: "Total Disk Size (GB)",
};

export const fallbackVmDetails: Record<string, string | number> = Object.entries({
  instanceName: "vm-sample",
  instanceZone: "asia-south1-a",
  machineType: "n1-sample-type",
  instanceId: "11222333-sample-id",
  status: "PROVISIONING",
  creationTimestamp: "Unknown",
  publicIp: "N.A",
  cpuPlatform: "Unknown",
  cpuCores: 4,
  memoryMb: 4096,
  diskGb: 10,
}).reduce((acc, [key, value]) => {
  acc[vmAliases[key] || key] = value;
  return acc;
}, {} as Record<string, string | number>);

export const fetchVmDetails = async (
  isFallback: boolean
): Promise<Record<string, string | number>> => {
  if (isFallback) {
    return fallbackVmDetails;
  }

  const response = await fetch(API_ENDPOINTS.MACHINE);
  if (!response.ok) {
    throw new Error("Failed to fetch VM details");
  }

  const data: VmDetailsResponse = await response.json();

  const transformedData: Record<string, string | number> = {};
  Object.entries(data).forEach(([key, value]) => {
    transformedData[vmAliases[key] || key] = value;
  });

  return transformedData;
};

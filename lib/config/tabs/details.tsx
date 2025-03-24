export const details = {
    cardTitle: "Instance details",
    cardDescription: "Detailed information about this instance",
    fields: [
      {
        title: "Instance ID",
        key: "instanceId",
      },
      {
        title: "Instance name",
        key: "instanceName",
      },
      {
        title: "Instance type",
        key: "machineType",
      },
      {
        title: "Availability zone",
        key: "region",
      },
      {
        title: "Launch time",
        key: "formattedDate",
      },
      {
        title: "Platform",
        key: "cpuPlatform",
      },
      {
        title: "vCPU",
        key: "cpuCores",
        suffix: " cores",
      },
      {
        title: "Memory",
        key: "memoryGb",
        suffix: " GB",
      },
      {
        title: "Used storage",
        key: "maxStorageGb",
        transform: (value: number) => value.toFixed(2) + " GB",
      },
    ],
};
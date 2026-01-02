import { Monitor, Globe, FileCog, ShieldUser, Logs } from "lucide-react";

export const tabs = [
  { value: "MOTD", label: "MOTD", icon: Globe },
  { value: "details", label: "Details", icon: Monitor },
  { value: "modlist", label: "Mod List", icon: FileCog },
  { value: "admin-controls", label: "Admin", icon: ShieldUser },
  {value: "logs", label:"Logs", icon: Logs}
];
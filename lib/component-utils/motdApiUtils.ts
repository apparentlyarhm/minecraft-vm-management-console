import { useQuery } from "@tanstack/react-query";
import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";

export type MOTDResponse = {
  hostname: string;
  hostIp: string;
  plugins: string;
  numPlayers: number;
  players: string[];
  gameType: string;
  um: string;
  maxPlayers: number;
  hostPort: number;
  version: string;
  map: string;
  gameId: string;
};

export type ModsResponse = {
  updatedAt: string
  mods: string[]
}

export const MOTDAliases: Record<string, string> = {
  hostname: "Message of the day",
  plugins: "Plugins",
  numPlayers: "Number of players online",
  players: "Online players",
  gameType: "Game Type",
  maxPlayers: "Max Players",
  hostPort: "Server Port",
  version: "Minecraft Version",
  map: "World Name",
  gameId: "Game ID",
};

export const fallbackMotd: Record<string, string | number | string[]> = {
  "Message of the day": "Fallback Server",
  Plugins: "Essentials, WorldEdit",
  "Number of players online": 2,
  "Online players": ["name1", "name2"],
  "Game Type": "SMP",
  "Max Players": 20,
  "Server Port": 25565,
  "Minecraft Version": "1.20.1",
  "World Name": "world",
  "Game ID": "MINECRAFT",
};

export const fetchMotd = async (
  address: string,
  isFallback: boolean
): Promise<Record<string, string | number | string[]>> => {
  if (isFallback) {
    return fallbackMotd;
  }

  const url = `${API_ENDPOINTS.MOTD}?address=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  if (!response.ok) {
    return fallbackMotd;
  }

  const data: MOTDResponse = await response.json();

  const transformedData: Record<string, string | number | string[]> = {};
  Object.entries(data).forEach(([key, value]) => {
    transformedData[MOTDAliases[key] || key] = value;
  });
  return transformedData;
};


const fetchModList = async (
  isFallback: boolean,
  token: string
): Promise<ModsResponse> => {

  if (isFallback) {
    return {
      updatedAt: "N/A",
      mods: ["FallbackMod1", "FallbackMod2"],
    };
  }

  const response = await fetch(API_ENDPOINTS.MODS, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (response.status === 401) {
    await initiateLogin()
    throw new Error("Need to login. Please wait..")
  }

  if (!response.ok) {
    throw new Error("Failed to fetch ModList!");
  }

  const data: ModsResponse = await response.json()
  return data;
}

export const getDownloadLink = async (
  fileName: string,
  token: string | null
): Promise<{ message: string }> => {

  if (!token) {
        // this will never reach
        throw new Error("Token is needed");
  }
  const url = `${API_ENDPOINTS.DOWNLOAD}/${encodeURIComponent(fileName)}`;
  const res = await fetch(url, {
    headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
  })

  const data = await res.json()

  if (res.status == 404) {
    throw new Error("It seems the file was not found on the server");
  }

  if (!res.ok) {
    throw new Error(data.message || 'Couldnt get the download link');
  }
  return data;
}

export const useModList = (
    isFallback: boolean,
    token: string | null,
    isEnabled: boolean
) => {
    return useQuery({
        queryKey: ['server-mods', isFallback, token],
        queryFn: () => fetchModList(isFallback, token!),

        enabled: !!token && isEnabled,
        staleTime: 1000 * 60 * 5,

        retry: isFallback ? false : 1,
    });
};

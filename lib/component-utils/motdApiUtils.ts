import API_ENDPOINTS from "../config/endpointConfig";

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
  hostIp: "string",
  plugins: "Plugins",
  numPlayers: "Number of players online",
  players: "Online players",
  gameType: "Game Type",
  um: "what is this",
  maxPlayers: "Max Players",
  hostPort: "Server Port",
  version: "Minecraft Version",
  map: "World Name",
  gameId: "Game ID",
};

export const fetchMotd = async (
  address: string
): Promise<Record<string, string | number | string[]>> => {
  const url = `${API_ENDPOINTS.MOTD}?address=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch MOTD");
  }
  const data: MOTDResponse = await response.json();

  const transformedData: Record<string, string | number | string[]> = {};

  Object.entries(data).forEach(([key, value]) => {
    transformedData[MOTDAliases[key] || key] = value;
  });
  return transformedData;
};


export const fetchModList = async (): Promise<ModsResponse> => {
  const response = await fetch(API_ENDPOINTS.MODS);
  if (!response.ok) {
    throw new Error("Failed to fetch ModList!");
  }

  const data: ModsResponse = await response.json()
  return data;
}

export const getDownloadLink = async (fileName: string): Promise<{ message: string }> => {

  const url = `${API_ENDPOINTS.DOWNLOAD}/${encodeURIComponent(fileName)}`;
  const res = await fetch(url)

  const data = await res.json()
  if (res.status == 404) {
    throw new Error(data.message);
  }

  if (!res.ok) {
    throw new Error(data.message || 'Failed to purge firewall');
  }
  return data;
}
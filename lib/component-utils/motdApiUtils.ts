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

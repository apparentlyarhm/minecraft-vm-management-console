import API_ENDPOINTS from "../config/endpointConfig";

export const executeRCON = async (isFallback: boolean, command: string, args: string[], address: string): Promise<Record<string, string>> => {
  if (isFallback) {
    return {
      message: "test"
    };
  }

  const url = `${API_ENDPOINTS.RCON}?address=${encodeURIComponent(address)}`
  
  const response = await fetch(url, {
    method: 'POST',
    
    headers: {
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({
        command: command,
        arguments: args
    }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to send execution request");
  }

  const data = await response.json()
  return data;
}
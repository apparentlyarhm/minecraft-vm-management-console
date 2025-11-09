import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";

export const executeRCON = async (isFallback: boolean, command: string, args: string[], address: string, token: string): Promise<Record<string, string>> => {
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
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            command: command,
            arguments: args
        }),
    });

    // logic is reused from the firewall one
    if (response.status === 401) {
        await initiateLogin()
    }

    const data = await response.json()
    if (response.status === 403) {
        throw new Error("You are not allowed to perform this action.");
    }

    if (!response.ok) {
        throw new Error("Failed to execute command");
    }

    return data;
}
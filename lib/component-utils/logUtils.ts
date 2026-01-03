import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";
import {
    useQuery,
} from '@tanstack/react-query'

export type LogEntry = {
    timestamp: string;
    level: string;
    src: string;
    message: string;
};

export type LogResponse = {
    items: LogEntry[]
}

const fetchLogs = async (
    address: string | undefined,
    c: string,
    isFallback: boolean
): Promise<LogResponse> => {

    if (!address) {
        return FALLBACK
    }

    if (isFallback) {
        return FALLBACK
    }

    const url = `${API_ENDPOINTS.LOGS}?address=${encodeURIComponent(address)}&c=${encodeURIComponent(c)}`;
    const res = await fetch(url)

    // might remove this later
    if (res.status === 404) {
        return {items: []}
    }

    if (res.status === 401) {
        await initiateLogin()
        throw new Error("Need to login. Please wait..")
    }
    if (!res.ok) {
        throw new Error("Failed to execute command");
    }

    const data = await res.json()
    return data;

}


const FALLBACK: LogResponse = {
    items: [
        {
            "timestamp": "02Jan2026 17:15:11.405",
            "level": "INFO",
            "src": "net.minecraft.server.MinecraftServer/",
            "message": ": ligmahbulls has made the advancement [Cobweb Entanglement]"
        },
        {
            "timestamp": "02Jan2026 17:15:11.405",
            "level": "INFO",
            "src": "net.minecraft.server.MinecraftServer/",
            "message": ": Karma0o7 fell from a high place"
        },
        {
            "timestamp": "02Jan2026 17:15:11.405",
            "level": "WARN",
            "src": "gravestone/",
            "message": ": The death ID of player Karma0o7 is 10a665a3-f0ce-4273-8868-17f3c6f7e2e1"
        },
        {
            "timestamp": "02Jan2026 17:15:11.405",
            "level": "ERROR",
            "src": "pingwheel/",
            "message": ": Channel update: ligmahbulls -> default"
        },]
}

// against the convention but whos gonna stop me?
export const useLogs = (address: string | undefined, c: string, isFallback: boolean) => {
    return useQuery({
        // Unique key for caching. If address changes, it refetches automatically.
        queryKey: ['server-logs', address, c, isFallback],
        queryFn: () => fetchLogs(address, c, isFallback),

        // If it's fallback, don't retry on error
        retry: isFallback ? false : 2,

        staleTime: 1000 * 1,
        enabled: !!address,
    });
};
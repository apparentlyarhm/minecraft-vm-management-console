import { MinecraftMetricsResponse } from "@/components/ui/performance/types";
import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";
import { useEffect } from "react";
import {
    useQuery,
} from '@tanstack/react-query'


const fetchMetricState = async (
    address: string | undefined,
    isFallback: boolean,

    // we might need token in the future
    // token: string 
): Promise<MinecraftMetricsResponse> => {
    console.debug("[useMetricState] fetchMetricState called", {
        address: address ?? null,
        isFallback,
    });

    if (!address) {
        return FALLBACK
    }

    if (isFallback) {
        return FALLBACK
    }

    const url = `${API_ENDPOINTS.METRICS}?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`
        },
    })
    if (res.status === 401) {
        await initiateLogin()
        throw new Error("Need to login. Please wait..")
    }

    if (res.status === 403) {
        throw new Error("You dont have permissions to view metrics of the server")
    }

    if (!res.ok) {
        throw new Error("Something went wrong.");
    }

    const data = await res.json()
    return data;
}

const FALLBACK: MinecraftMetricsResponse = {
    cpu: 4,
    loaded_chunks: 123,
    total_loaded_chunks: 456,
    mspt: 12,
    tps: 20.00000000,
    entities: 204,
    handshakes: 12,
    jvm_memory_used: 0,
    jvm_memory_used_heap: 0,
    jvm_memory_max: 0,
    jvm_memory_max_heap: 0,
    jvm_gc: 0
}

export const useMetricState = (
    address: string | undefined,
    isFallback: boolean,
    // token: string,
    isEnabled: boolean,
) => {
    const shouldPoll = !!address && isEnabled;

    useEffect(() => {
        console.info(
            `[useMetricState] polling ${shouldPoll ? "enabled" : "paused"}`,
            {
                address: address ?? null,
                isFallback,
                isEnabled,
            }
        );
    }, [address, isFallback, isEnabled, shouldPoll]);

    return useQuery({
        queryKey: ['metrics', address, isFallback],
        queryFn: () => fetchMetricState(address, isFallback),
        enabled: shouldPoll,
        staleTime: 1000 * 1,
        placeholderData: (previousData) => previousData,
        refetchInterval: shouldPoll ? 1000 * 5 : false,
    })
}
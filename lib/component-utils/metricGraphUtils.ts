import { GenericMetricTimeSeries } from "@/components/ui/performance/types";
import API_ENDPOINTS from "../config/endpointConfig";
import { initiateLogin } from "./loginUtils";
import {
    useQuery,
} from '@tanstack/react-query'



const fetchMetricTimeSeries = async (
    metric: string,
    address: string,
    isFallback: boolean,
    start?: number,
    end?: number,
): Promise<GenericMetricTimeSeries[]> => {

    // all possible values for metric is given by that array we defined
    // in types.ts

    // we dont need to enforce it here because this metric string
    // will not come from user input. 
    if (!address) {
        return FALLBACK
    }

    if (isFallback) {
        console.log("Using fallback metrics");
        return FALLBACK
    }

    const params = new URLSearchParams({
        address,
        metric,
    });
    if (start !== undefined) params.append('start', start.toString());
    if (end !== undefined) params.append('end', end.toString());
    
    const url = `${API_ENDPOINTS.METRICS_TIME_SERIES}?${params.toString()}`;
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

// these data points are a representation of ticks per second.
// ideal rate for minecraft is 20 so we will just generate data around that 
const generateFallbackMetrics = (): GenericMetricTimeSeries[] => {
    const dataPoints: GenericMetricTimeSeries[] = [];
    const startTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const interval = 15; // 15 seconds

    for (let i = 0; i < 240; i++) {
        const timestamp = startTime + (i * interval);
        const value = parseFloat((19 + Math.random() * 0.9).toFixed(5));
        dataPoints.push({
            timestamp,
            value,
        });
    }
    return dataPoints;
};

const FALLBACK: GenericMetricTimeSeries[] = generateFallbackMetrics();


export const useMetricTimeSeries = (
    metric: string,
    address: string | undefined,
    isFallback: boolean,
    start?: number,
    end?: number,
    isEnabled: boolean = true,
) => {
    const shouldFetch = !!address && isEnabled;

    return useQuery({
        queryKey: ['metricTimeSeries', metric, address, isFallback, start, end],
        queryFn: () => fetchMetricTimeSeries(metric, address || "", isFallback, start, end),
        // enabled: !isFallback && shouldFetch,
        refetchInterval: 1000 * 15,
    });
};
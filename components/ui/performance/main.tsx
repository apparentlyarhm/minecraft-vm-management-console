import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { HEADER, HelpModal, LOADING } from "../mod-list";
import { AlertCircle, Cable, InfoIcon } from "lucide-react";
import { useMetricState } from "@/lib/component-utils/metricsUtils";
import { allMetrics, MinecraftMetricsResponse } from "./types";

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0 || !bytes || isNaN(bytes)) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


const PerformanceGraphs = ({
    title,
    description,
    help,
    value,
    isFallback, // this boolean keeps the UI stable when the backend is down. all components have this
    address,
    isActive,
}: {
    title: string;
    description: string;
    help?: string;
    value: string;
    isFallback: boolean;
    address: string | undefined;
    isActive: boolean;
}) => {
    // auth stuff
    const [token, setToken] = React.useState<string | null>(null);
    const [isTokenLoaded, setIsTokenLoaded] = React.useState(false);

    // help modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [hasInitiated, setHasInitiated] = React.useState(false);

    React.useEffect(() => {
        const stored = localStorage.getItem("app_token");
        setToken(stored);
        setIsTokenLoaded(true);
    }, []);

    const shouldFetchMetrics = isActive && hasInitiated && !!token && isTokenLoaded;

    const {
        data: serverState,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        isPlaceholderData // True if showing old data while fetching new count
    } = useMetricState(
        address,
        isFallback,
        // token,
        shouldFetchMetrics
    );

    React.useEffect(() => {
        console.info(
            `[PerformanceGraphs] tab=${isActive ? "active" : "inactive"}, polling=${shouldFetchMetrics ? "enabled" : "paused"}`
        );
    }, [isActive, shouldFetchMetrics]);


    // const isBusy = isLoading || isRefetching;

    const renderContent = () => {
        if (!isTokenLoaded) return <LOADING text="Initializing..." />;
        if (!token) return <AuthError />;

        if (!hasInitiated) {
            return <INIT onConnect={() => setHasInitiated(true)} />;
        }

        if (isError) return <ApiError error={error} />;
        if (isLoading) return <LOADING text="Fetching server state..." />;
        if (!serverState) return <EmptyState />;

        return (
            <DATA serverState={serverState} isStale={isRefetching} />
        );
    };

    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">

                <HEADER
                    title={title}
                    description={description}
                    isBusy={false}
                    onRefresh={refetch}
                    onHelpClick={help ? () => setIsModalOpen(true) : undefined}
                />


                <CardContent className="py-2 px-4 border-b last:border-0">

                    {isFallback && (
                        <div className="mb-4 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full border border-yellow-300">
                            Sample data since the server is currently unavailable
                        </div>
                    )}

                    {renderContent()}
                </CardContent>

                {help && isModalOpen && (
                    <HelpModal helpText={help} onClose={() => setIsModalOpen(false)} />
                )}
            </Card>
        </TabsPrimitive.TabsContent>
    )
}

export default PerformanceGraphs

const INIT = ({ onConnect }: { onConnect: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
        <div className="bg-gray-100 p-4 rounded-full">
            <Cable className="w-8 h-8 text-gray-400" />
        </div>

        <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-900">Ready to Fetch</p>
        </div>

        <button
            onClick={onConnect}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800"
        >
            Get Performance Graphs
        </button>
    </div>
);



const AuthError = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <AlertCircle className="w-8 h-8 text-gray-300" />
        <span className="text-xs">Please log in to view server metrics.</span>
    </div>
);

const ApiError = ({ error }: { error: unknown }) => (
    <div className="text-red-600 p-4 text-sm flex items-center justify-center border-b border-red-100">
        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
        {error instanceof Error ? error.message : "Failed to load metrics"}
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-xs">No metrics found, or they may be temporarily disabled.</span>
    </div>
);


const DATA = ({
    serverState,
    isStale,
}: {
    serverState: MinecraftMetricsResponse;
    isStale: boolean;
}) => {
    const heapUsage =
        serverState.jvm_memory_max_heap > 0
            ? (serverState.jvm_memory_used_heap /
                serverState.jvm_memory_max_heap) *
            100
            : 0;

    const nonHeapUsage =
        serverState.jvm_memory_max > 0
            ? (serverState.jvm_memory_used /
                serverState.jvm_memory_max) *
            100
            : 0;

    const getHelpText = (metric: string) => {
        return allMetrics.find(m => m.value === metric)?.description || "";
    }

    return (
        <div className={`flex-1 overflow-y-auto custom-scrollbar max-h-[500px] transition-opacity duration-200 ${isStale ? "opacity-30" : "opacity-100"}`}>
            <div
                className={`p-4`}
            >   
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        Performance
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard
                            label="TPS"
                            value={serverState.tps.toFixed(1)}
                            suffix="/ 20"
                            help={getHelpText("tps")}
                        />

                        <MetricCard
                            label="MSPT"
                            value={serverState.mspt.toFixed(1)}
                            suffix="ms"
                            help={getHelpText("mspt")}
                        />
                    </div>
                </section>

                {/* JVM Memory */}
                <section className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        JVM Memory
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <MemoryCard
                            label="Heap"
                            used={serverState.jvm_memory_used_heap}
                            max={serverState.jvm_memory_max_heap}
                            percentage={heapUsage}
                            help={getHelpText("jvmMemHeap")}
                        />

                        <MemoryCard
                            label="Non-Heap"
                            used={serverState.jvm_memory_used}
                            max={serverState.jvm_memory_max}
                            percentage={nonHeapUsage}
                            help={getHelpText("jvmMem")}
                        />
                    </div>
                </section>

                {/* World */}
                <section className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        World
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        <MetricCard
                            label="Loaded Chunks"
                            value={serverState.loaded_chunks.toLocaleString()}
                            help={getHelpText("chunks")}
                        />

                        <MetricCard
                            label="Total Chunks"
                            value={serverState.total_loaded_chunks.toLocaleString()}
                            help={getHelpText("totalChunks")}
                        />

                        <MetricCard
                            label="Entities"
                            value={serverState.entities.toLocaleString()}
                            help={getHelpText("entities")}
                        />
                    </div>
                </section>

                {/* System */}
                <section className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        System
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard
                            label="CPU"
                            value={serverState.cpu.toFixed(1)}
                            suffix="%"
                            help={getHelpText("cpu")}
                        />

                        <MetricCard
                            label="GC Activity"
                            value={serverState.jvm_gc.toFixed(2)}
                            suffix="%"
                            help={getHelpText("jvmGc")}
                        />
                    </div>
                </section>

                {isStale && (
                    <div className="mt-3 text-center text-xs text-gray-400 italic">
                        Showing stale server data
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({
    label,
    value,
    suffix,
    help
}: {
    label: string;
    value: string;
    suffix?: string;
    help?: string;
}) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="text-xs text-gray-500">{label}</div>

        <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-semibold text-gray-900">
                {value}
            </span>

            {suffix && (
                <span className="text-xs text-gray-400">
                    {suffix}
                </span>
            )}

        </div>

        {help && (
            <p className="text-xs text-gray-400 italic py-2">{help}</p>
        )}
    </div>
);


const MemoryCard = ({
    label,
    used,
    max,
    percentage,
    help,
}: {
    label: string;
    used: number;
    max: number;
    percentage: number;
    help?: string;
}) => (
    <div
        className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-xs text-gray-400">
                {percentage.toFixed(0)}%
            </span>
        </div>

        <div className="mt-1 text-sm font-medium text-gray-900">
            {formatBytes(used)}{" "}
            <span className="font-normal text-gray-400">
                / {formatBytes(max)}
            </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
                className="h-full rounded-full bg-gray-400 transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
            />
        </div>

        {help && (
            <p className="text-xs text-gray-400 italic py-2">{help}</p>
        )}
    </div>
);
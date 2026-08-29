export type MinecraftMetricsResponse = {
    loaded_chunks: number;
    total_loaded_chunks: number;
    mspt: number;
    tps: number;
    entities: number;
    handshakes: number;
    jvm_memory_used: number;
    jvm_memory_used_heap: number;
    jvm_memory_max: number;
    jvm_memory_max_heap: number;
    jvm_gc: number;
    cpu: number;
};

export type GenericMetricTimeSeries = {
    timestamp: number;
    value: number;
}

export type PromSample = {
    timestamp: number;
    value: number;
};

export type MinecraftMetricTimeSeries = {
    metric: string;
    values: PromSample[];
};

export type MinecraftMetricsTimeSeriesResponse = MinecraftMetricTimeSeries[];

export type MetricType = {
    name: string;
    value: string;
    description: string;
    category: MetricCategory;
    referenceLineValue?: number;
}

export type GroupMetricConfig = {
    metric: string;
    label: string;
    color: string;
    referenceLineValue?: number;
};

export type MetricGroupConfig = {
    id: string;
    name: string;
    description: string;
    category: MetricCategory;
    metrics: GroupMetricConfig[];
};

export type MetricCategory = "number" // for ticks, entities, and similar countable metrics
| "percentage" // say for cpu usage and related metrics
| "ms" // for mspt or similar metric
| "bytes" // for jvm stuff

export const allMetrics: MetricType[] = [
    {
        name: "TPS",
        value: "tps",
        description: "Ticks processed by the server per second. 20 TPS is the ideal target.",
        category: "number",
        referenceLineValue: 20
    },
    {
        name: "MSPT",
        value: "mspt",
        description: "Average time the server takes to process one tick. Lower is better; below 50 ms is ideal.",
        category: "ms",
        referenceLineValue: 50,
    },
    {
        name: "Entities",
        value: "entities",
        description: "Total number of entities currently loaded in the server. Currently the formula adds ONLY Creatures and Monsters across all 3 dimensions. This gives a good enough idea of the totality of entities present.",
        category: "number"
    },
    {
        name: "Chunks Overworld",
        value: "chunks",
        description: "Number of chunks currently loaded in the Overworld.",
        category: "number"
    },
    {
        name: "Total Chunks",
        value: "totalChunks",
        description: "Total number of chunks currently loaded across all dimensions.",
        category: "number"
    },
    {
        name: "Handshakes",
        value: "handshakes",
        description: "Number of player connection handshakes processed by the server.",
        category: "number"
    },
    {
        name: "JVM Memory Used in Non-Heap",
        value: "jvmMem",
        description: "Amount of JVM non-heap memory currently in use, including areas such as class metadata and JIT-compiled code.",
        category: "bytes"
    },
    {
        name: "JVM Memory Used in Heap",
        value: "jvmMemHeap",
        description: "Amount of JVM heap memory currently in use by the server. This includes memory used for object allocation and other runtime data structures.",
        category: "bytes"
    },
    {
        name: "JVM Memory Max Non-Heap",
        value: "jvmMemMax",
        description: "Maximum amount of non-heap memory available to the JVM.",
        category: "bytes"
    },
    {
        name: "JVM Memory Max Heap",
        value: "jvmMemMaxHeap",
        description: "Maximum amount of heap memory available to the JVM.",
        category: "bytes"
    },
    {
        name: "JVM GC",
        value: "jvmGc",
        description: "Garbage collection activity in the JVM, across the 3 types- G1 Young, G1 Concurrent and G1 Old, in the last 5 minutes.",
        category: "number"
    },
    {
        name: "CPU",
        value: "cpu",
        description: "Average CPU usage percentage of the JVM process over the last 5 minutes, relative to a single CPU core. Because this metric is scaled to a single CPU core, the resulting percentage is not capped at 100%. For example, a value of 200% indicates that the JVM process used the equivalent of two full CPU cores during (this) measurement period.",
        category: "percentage"
    }
];

export const allMetricsFallback: MetricType[] = allMetrics;

export const groupedMetricGroups: MetricGroupConfig[] = [
    {
        id: "responsiveness",
        name: "Responsiveness",
        description: "Tracks ticks (TPS) and MSPT together to show server responsiveness.",
        category: "number",
        metrics: [
            { metric: "tps", label: "TPS", color: "#2563eb", referenceLineValue: 20 },
            { metric: "mspt", label: "MSPT", color: "#f97316", referenceLineValue: 50 },
        ],
    },
    {
        id: "memory",
        name: "Memory",
        description: "Shows JVM memory metrics (heap/non-heap used and max values).",
        category: "bytes",
        metrics: [
            { metric: "jvmMem", label: "Used Non-Heap", color: "#06b6d4" },
            { metric: "jvmMemHeap", label: "Used Heap", color: "#14b8a6" },
            { metric: "jvmMemMax", label: "Max Non-Heap", color: "#f97316" },
            { metric: "jvmMemMaxHeap", label: "Max Heap", color: "#a855f7" },
        ],
    },
    {
        id: "cpu",
        name: "CPU",
        description: "CPU usage only.",
        category: "percentage",
        metrics: [{ metric: "cpu", label: "CPU", color: "#ef4444" }],
    },
    {
        id: "general-server-metrics",
        name: "General Server Metrics",
        description: "All remaining server metrics excluding responsiveness, memory, and CPU groups.",
        category: "number",
        metrics: [
            { metric: "entities", label: "Entities", color: "#10b981" },
            { metric: "chunks", label: "Chunks Overworld", color: "#0ea5e9" },
            { metric: "totalChunks", label: "Total Chunks", color: "#6366f1" },
            { metric: "handshakes", label: "Handshakes", color: "#f59e0b" },
            { metric: "jvmGc", label: "JVM GC", color: "#e11d48" },
        ],
    },
];

const fallbackMetricSet = new Set(allMetricsFallback.map((metric) => metric.value));

export const groupedMetricGroupsFallback: MetricGroupConfig[] = groupedMetricGroups.filter((group) =>
    group.metrics.every((metricConfig) => fallbackMetricSet.has(metricConfig.metric))
);
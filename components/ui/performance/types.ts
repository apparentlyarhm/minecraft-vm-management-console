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

export type PromSample = {
    timestamp: number;
    value: number;
};

export type MinecraftMetricTimeSeries = {
    metric: string;
    values: PromSample[];
};

export type MinecraftMetricsTimeSeriesResponse = MinecraftMetricTimeSeries[];

type MetricType = {
    name: string;
    value: string;
    description: string;
}

export const allMetrics: MetricType[] = [
    {
        name: "TPS",
        value: "tps",
        description: "Ticks processed by the server per second. 20 TPS is the ideal target."
    },
    {
        name: "MSPT",
        value: "mspt",
        description: "Average time the server takes to process one tick. Lower is better; below 50 ms is ideal."
    },
    {
        name: "Entities",
        value: "entities",
        description: "Total number of entities currently loaded in the server. Currently the formula adds ONLY Creatures and Monsters across all 3 dimensions. This gives a good enough idea of the totality of entities present."
    },
    {
        name: "Chunks Overworld",
        value: "chunks",
        description: "Number of chunks currently loaded in the Overworld."
    },
    {
        name: "Total Chunks",
        value: "totalChunks",
        description: "Total number of chunks currently loaded across all dimensions."
    },
    {
        name: "Handshakes",
        value: "handshakes",
        description: "Number of player connection handshakes processed by the server."
    },
    {
        name: "JVM Memory Used in Non-Heap",
        value: "jvmMem",
        description: "Amount of JVM non-heap memory currently in use, including areas such as class metadata and JIT-compiled code."
    },
    {
        name: "JVM Memory Used in Heap",
        value: "jvmMemHeap",
        description: "Amount of JVM heap memory currently in use by the server. This includes memory used for object allocation and other runtime data structures."
    },
    {
        name: "JVM Memory Max Non-Heap",
        value: "jvmMemMax",
        description: "Maximum amount of non-heap memory available to the JVM."
    },
    {
        name: "JVM Memory Max Heap",
        value: "jvmMemMaxHeap",
        description: "Maximum amount of heap memory available to the JVM."
    },
    {
        name: "JVM GC",
        value: "jvmGc",
        description: "Garbage collection activity in the JVM, across the 3 types- G1 Young, G1 Concurrent and G1 Old, in the last 5 minutes."
    },
    {
        name: "CPU",
        value: "cpu",
        description: "Average CPU usage percentage of the JVM process over the last 5 minutes, relative to a single CPU core. Because this metric is scaled to a single CPU core, the resulting percentage is not capped at 100%. For example, a value of 200% indicates that the JVM process used the equivalent of two full CPU cores during (this) measurement period."
    }
];
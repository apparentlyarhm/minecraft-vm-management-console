"use client";

import * as React from "react";
import {
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { allMetrics, allMetricsFallback, GenericMetricTimeSeries, MetricCategory } from "../performance/types";
import GroupedGraphTooltip from "./GroupedGraphTooltip";

export type GroupedSeries = {
    metric: string;
    label: string;
    color: string;
    points: GenericMetricTimeSeries[];
    referenceLineValue?: number;
};

type GroupedGraphWrapperProps = {
    series: GroupedSeries[];
    metricCategory?: MetricCategory;
    height?: number;
    yAxisWidth?: number;
};

type CombinedDataPoint = {
    timestamp: number;
    [metric: string]: number;
};

const BYTES_IN_GB = 1024 * 1024 * 1024;

const toRounded = (value: number) => Number(value.toFixed(2));

const formatByCategory = (value: number, category: MetricCategory): string => {
    if (!Number.isFinite(value)) return "-";

    switch (category) {
        case "bytes":
            return `${toRounded(value / BYTES_IN_GB)} GB`;
        case "percentage":
            return `${toRounded(value)}%`;
        case "ms":
            return `${toRounded(value)} ms`;
        case "number":
        default:
            if (Number.isInteger(value)) return value.toLocaleString();
            return toRounded(value).toLocaleString();
    }
};

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const buildCombinedData = (series: GroupedSeries[]): CombinedDataPoint[] => {
    const byTimestamp = new Map<number, CombinedDataPoint>();

    for (const entry of series) {
        for (const point of entry.points) {
            if (!Number.isFinite(point.timestamp) || !Number.isFinite(point.value)) continue;

            const existing = byTimestamp.get(point.timestamp) ?? { timestamp: point.timestamp };
            existing[entry.metric] = point.value;
            byTimestamp.set(point.timestamp, existing);
        }
    }

    return Array.from(byTimestamp.values()).sort((a, b) => a.timestamp - b.timestamp);
};

const GroupedGraphWrapper = ({
    series,
    metricCategory = "number",
    height = 400,
    yAxisWidth = 56,
}: GroupedGraphWrapperProps) => {
    const combinedData = React.useMemo(() => buildCombinedData(series), [series]);
    const formatValue = React.useCallback(
        (value: number) => formatByCategory(value, metricCategory),
        [metricCategory]
    );

    const metricDescriptions = React.useMemo(() => {
        const knownMetrics = [...allMetrics, ...allMetricsFallback];
        const map = new Map<string, string>();
        for (const metric of knownMetrics) {
            if (metric?.description) {
                map.set(metric.value, metric.description);
            }
        }
        return map;
    }, []);

    if (series.length === 0 || combinedData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-xs text-gray-400 border rounded-md">
                No grouped graph data found.
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTimestamp}
                        tick={{ fontSize: 12 }}
                        minTickGap={24}
                    />

                    <YAxis
                        width={yAxisWidth}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatValue(Number(value))}
                    />

                    <Tooltip
                        content={({ active, payload, label }) => (
                            <GroupedGraphTooltip
                                active={active}
                                payload={payload}
                                label={label}
                                metricDescriptions={metricDescriptions}
                                formatTimestamp={formatTimestamp}
                                formatValue={formatValue}
                            />
                        )}
                    />

                    <Legend verticalAlign="top" height={40} />

                    {series.map((seriesEntry) => (
                        <Line
                            key={seriesEntry.metric}
                            type="monotone"
                            dataKey={seriesEntry.metric}
                            stroke={seriesEntry.color}
                            strokeWidth={2}
                            dot={false}
                            name={seriesEntry.label}
                            isAnimationActive={true}
                            connectNulls
                        />
                    ))}

                    {series.map((seriesEntry) =>
                        seriesEntry.referenceLineValue === undefined ? null : (
                            <ReferenceLine
                                key={`${seriesEntry.metric}-reference`}
                                y={seriesEntry.referenceLineValue}
                                stroke={seriesEntry.color}
                                strokeDasharray="4 4"
                            />
                        )
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GroupedGraphWrapper;

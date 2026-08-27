"use client";

import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
    ReferenceLine
} from "recharts";
import * as React from "react";
import { GenericMetricTimeSeries, MetricCategory } from "../performance/types";

type GraphWrapperProps = {
	data: GenericMetricTimeSeries[] | unknown;
	metricLabel?: string;
	metricCategory?: MetricCategory;
	lineColor?: string;
	height?: number;
	yAxisWidth?: number;
    referenceLineValue?: number;
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

const toPoint = (entry: unknown): GenericMetricTimeSeries | null => {
	if (!entry || typeof entry !== "object") return null;

	if (Array.isArray(entry)) {
		const [ts, val] = entry;
		const timestamp = Number(ts);
		const value = Number(val);
		if (Number.isFinite(timestamp) && Number.isFinite(value)) {
			return { timestamp, value };
		}
		return null;
	}

	const maybePoint = entry as { timestamp?: unknown; value?: unknown };
	const timestamp = Number(maybePoint.timestamp);
	const value = Number(maybePoint.value);

	if (!Number.isFinite(timestamp) || !Number.isFinite(value)) return null;

	return { timestamp, value };
};

const normalizeSeries = (input: unknown): GenericMetricTimeSeries[] => {
	if (Array.isArray(input)) {
		return input.map(toPoint).filter((p): p is GenericMetricTimeSeries => p !== null);
	}

	if (input && typeof input === "object") {
		const withValues = input as { values?: unknown };
		if (Array.isArray(withValues.values)) {
			return withValues.values
				.map(toPoint)
				.filter((p): p is GenericMetricTimeSeries => p !== null);
		}
	}

	return [];
};

const formatTimestamp = (timestamp: number) => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const GraphWrapper = ({
	data,
	metricLabel = "Value",
	metricCategory = "number",
	lineColor = "#2563eb",
	height = 280,
	yAxisWidth = 48,
	referenceLineValue,
}: GraphWrapperProps) => {
	const safeData = React.useMemo(() => normalizeSeries(data), [data]);
	const gradientId = React.useId().replace(/:/g, "");
	const formatValue = React.useCallback(
		(value: number) => formatByCategory(value, metricCategory),
		[metricCategory]
	);

	return (
		<div className="w-full" style={{ height }}>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={safeData}
					margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
				>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor={lineColor} stopOpacity={0.8} />
							<stop offset="95%" stopColor={lineColor} stopOpacity={0} />
						</linearGradient>
					</defs>

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
						label={{
							value: metricLabel,
							angle: -90,
							position: "insideLeft",
							style: { fill: "#6b7280", fontSize: 12 },
						}}
					/>

                    {referenceLineValue !== undefined && (
                        <ReferenceLine
                            y={referenceLineValue}
                            stroke="red"
                            strokeDasharray="3 3"
                        />
                    )}

					<Tooltip
						labelFormatter={(label) => formatTimestamp(Number(label))}
						formatter={(value) => [formatValue(Number(value)), metricLabel]}
					/>

					<Area
						type="monotone"
						dataKey="value"
						fill={`url(#${gradientId})`}
						stroke={lineColor}
						strokeWidth={2}
						dot={false}
						isAnimationActive={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default GraphWrapper;

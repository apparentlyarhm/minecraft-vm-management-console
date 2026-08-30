import * as React from "react";

type TooltipEntry = {
    dataKey?: string | number | ((obj: unknown) => unknown);
    name?: string | number;
    value?: string | number | readonly (string | number)[];
    color?: string;
};

type GroupedGraphTooltipProps = {
    active?: boolean;
    payload?: readonly TooltipEntry[];
    label?: string | number;
    metricDescriptions: Map<string, string>;
    formatTimestamp: (timestamp: number) => string;
    formatValue: (value: number) => string;
};

const GroupedGraphTooltip = ({
    active,
    payload,
    label,
    metricDescriptions,
    formatTimestamp,
    formatValue,
}: GroupedGraphTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-gray-700">
                {formatTimestamp(Number(label))}
            </p>

            <div className="mt-2 space-y-2">
                {payload.map((entry) => {
                    const metricKey = String(entry.dataKey ?? "");
                    const description = metricDescriptions.get(metricKey);

                    return (
                        <div key={`${metricKey}-${entry.name ?? "metric"}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: entry.color ?? "#9ca3af" }}
                                    />

                                    <span className="text-xs font-medium text-gray-800">
                                        {entry.name ?? metricKey}
                                    </span>
                                </div>

                                <span className="text-xs font-semibold text-gray-900">
                                    {formatValue(Number(entry.value))}
                                </span>
                            </div>

                            {description && (
                                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GroupedGraphTooltip;

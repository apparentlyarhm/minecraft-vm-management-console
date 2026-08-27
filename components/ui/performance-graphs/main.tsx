import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Cable } from "lucide-react";
import { useMetricTimeSeries } from "@/lib/component-utils/metricGraphUtils";
import { HEADER, HelpModal, LOADING } from "../mod-list";
import { allMetrics, allMetricsFallback, GenericMetricTimeSeries, MetricCategory } from "../performance/types";
import GraphWrapper from "./GraphWrapper";

const PerformanceGraphsTab = ({
	title,
	description,
	help,
	value,
	isFallback,
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
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [selectedMetric, setSelectedMetric] = React.useState("tps");
	const [hasInitiated, setHasInitiated] = React.useState(false);

	const [token, setToken] = React.useState<string | null>(null);
	const [isTokenLoaded, setIsTokenLoaded] = React.useState(false);

	React.useEffect(() => {
		const stored = localStorage.getItem("app_token");
		setToken(stored);
		setIsTokenLoaded(true);
	}, []);

	const shouldFetchMetrics = isActive && hasInitiated && !!token && isTokenLoaded;

	// Keep a stable default window for now: last 1 hour.
	// const end = React.useMemo(() => Math.floor(Date.now() / 1000), []);
	// const start = React.useMemo(() => end - 3600, [end]);


    // TODO: Allow the user to select a custom time window for the metrics.
	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
		isPlaceholderData,
	} = useMetricTimeSeries(
		selectedMetric,
		address,
		isFallback,
        undefined,
        undefined,
		shouldFetchMetrics
	);

	const selectedMetricConfig =
		allMetrics.find((metric) => {
            return metric.value === selectedMetric
        }) 
    ||
    ({ name: selectedMetric, category: "number" as MetricCategory, referenceLineValue: undefined });

	const renderContent = () => {
		if (!isTokenLoaded) return <LOADING text="Initializing..." />;
		if (!token) return <AuthError />;

		if (!hasInitiated) {
			return <INIT onConnect={() => setHasInitiated(true)} />;
		}

		if (isError) return <ApiError error={error} />;
		if (isLoading) return <LOADING text="Fetching metric time-series..." />;
		if (!data || data.length === 0) return <EmptyState />;

		return (
			<DATA
				data={data}
				selectedMetric={selectedMetricConfig.name}
				selectedMetricCategory={selectedMetricConfig.category}
				isStale={isRefetching || isPlaceholderData}
				referenceLineValue={selectedMetricConfig.referenceLineValue}
			/>
		);
	};

	return (
		<TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
			<Card className="min-h-[400px]">
				<HEADER
					title={title}
					description={description}
					isBusy={isLoading || isRefetching}
					onRefresh={refetch}
					onHelpClick={help ? () => setIsModalOpen(true) : undefined}
				/>

				<CardContent className="py-2 px-4 border-b last:border-0">
					{isFallback && (
						<div className="mb-4 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full border border-yellow-300">
							Sample graph data since the server is currently unavailable
						</div>
					)}

					<div className="mb-4">
						<label className="text-xs text-gray-500 mr-2" htmlFor="metric-select">
							Metric
						</label>

						<select
							id="metric-select"
							value={selectedMetric}
							onChange={(event) => setSelectedMetric(event.target.value)}
							className="text-xs border rounded-md px-2 py-1 bg-white"
						>
							{(isFallback ? allMetricsFallback : allMetrics).map((metric) => (
								<option key={metric.value} value={metric.value}>
									{metric.name}
								</option>
							))}
						</select>
					</div>

					{renderContent()}
				</CardContent>

				{help && isModalOpen && (
					<HelpModal helpText={help} onClose={() => setIsModalOpen(false)} />
				)}
			</Card>
		</TabsPrimitive.TabsContent>
	);
};

export default PerformanceGraphsTab;

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
		<span className="text-xs">Please log in to view performance graphs.</span>
	</div>
);

const ApiError = ({ error }: { error: unknown }) => (
	<div className="text-red-600 p-4 text-sm flex items-center justify-center border-b border-red-100">
		<AlertCircle className="w-4 h-4 mr-2 shrink-0" />
		{error instanceof Error ? error.message : "Failed to load metric time-series"}
	</div>
);

const EmptyState = () => (
	<div className="flex flex-col items-center justify-center h-48 text-gray-400">
		<span className="text-xs">No graph data found.</span>
	</div>
);

const DATA = ({
	data,
	selectedMetric,
	selectedMetricCategory,
	isStale,
    referenceLineValue,
}: {
	data: GenericMetricTimeSeries[];
	selectedMetric: string;
	selectedMetricCategory: MetricCategory;
	isStale: boolean;
    referenceLineValue?: number;
}) => (
	<div className={`transition-opacity duration-200 ${isStale ? "opacity-50" : "opacity-100"}`}>
		<h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
			{selectedMetric}
		</h3>

		<GraphWrapper
			data={data}
			height={400}
			metricLabel={selectedMetric}
			metricCategory={selectedMetricCategory}
            referenceLineValue={referenceLineValue}
		/>
	</div>
);

export { GraphWrapper };

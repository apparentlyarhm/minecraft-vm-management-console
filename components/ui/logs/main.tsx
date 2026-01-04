import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Check, Copy, Info, RefreshCcw, Settings, Terminal } from "lucide-react";
import Spinner from "../Spinner";
import { LogEntry, useLogs } from "@/lib/component-utils/logUtils";

interface LogHeaderProps {
    title: string;
    description: string;
    lineCount: number;
    onLineCountChange: (count: number) => void;
    onRefresh: () => void;
    isBusy: boolean;
    onHelpClick?: () => void;
}

const LOG_OPTIONS = [100, 200, 300, 400, 500];

const LogComponent = ({
    title,
    description,
    help,
    value,
    isFallback, // this boolean keeps the UI stable when the backend is down. all components have this
    address
}: {
    title: string;
    description: string;
    help?: string;
    value: string;
    isFallback: boolean;
    address: string | undefined;
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [lineCount, setLineCount] = React.useState(100);

    const [hasInitiated, setHasInitiated] = React.useState(false);

    const [token, setToken] = React.useState<string | null>(null);
    const [isTokenLoaded, setIsTokenLoaded] = React.useState(false);

    React.useEffect(() => {
        const stored = localStorage.getItem("app_token");
        setToken(stored);
        setIsTokenLoaded(true);
    }, []);

    const {
        data: logs,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        isPlaceholderData // True if showing old data while fetching new count
    } = useLogs(address, lineCount.toString(), isFallback, token, hasInitiated);

    const isBusy = isLoading || isRefetching;

    const renderContent = () => {
        if (!isTokenLoaded) return <LOADING text="Initializing..." />;
        if (!token) return <AuthError />;

        if (!hasInitiated) {
            return <INIT onConnect={() => setHasInitiated(true)} />;
        }

        if (isError) return <ApiError error={error} />;
        if (isLoading) return <LOADING text="Fetching logs..." />;
        if (!logs || logs.items.length === 0) return <EmptyState />;

        return (
            <DATA
                items={logs.items}
                isStale={isRefetching || isPlaceholderData}
            />
        );
    };

    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">

                <HEADER
                    title={title}
                    description={description}
                    lineCount={lineCount}
                    isBusy={isBusy}
                    onLineCountChange={setLineCount}
                    onRefresh={refetch}
                    onHelpClick={help ? () => setIsModalOpen(true) : undefined}
                />

                <CardContent className="py-2 px-4 border-b last:border-0">
                    {renderContent()}

                    {help && isModalOpen && (
                        <HelpModal helpText={help} onClose={() => setIsModalOpen(false)} />
                    )}
                </CardContent>

            </Card>
        </TabsPrimitive.TabsContent>
    )
}

const LogRow = ({ log }: { log: LogEntry }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(log.message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getLevelStyle = (level: string) => {
        switch (level.toUpperCase()) {
            case 'ERROR': return 'text-red-600 bg-red-400 border-red-200';
            case 'WARN': return 'text-amber-600 bg-amber-300 border-amber-200';
            default: return 'text-emerald-600 bg-emerald-300 border-emerald-200';
        }
    };

    return (
        <div
            onClick={handleCopy}
            className="group flex gap-3 p-2 text-xs border-b rounded-lg hover:bg-gray-100 cursor-pointer font-mono items-center"
        >
            <span className={`h-4 w-4 rounded-full shrink-0 ${getLevelStyle(log.level)}`}></span>

            <span className={`px-2 py-1 rounded text-xs font-bold border shrink-0 uppercase`}>
                {log.timestamp.slice(10, log.timestamp.length)}
            </span>

            <div className="flex-1 min-w-0">

                <span className="text-gray-500 break-all group-hover:text-gray-900">
                    {log.message}
                </span>

                {log.src && (
                    <span className="text-gray-300 text-xs select-none opacity-0 group-hover:opacity-100">
                        --({log.src})
                    </span>
                )}

            </div>

            <div className="shrink-0 opacity-0 group-hover:opacity-100 flex items-center">
                {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4 text-blue-400" />
                )}
            </div>
        </div>
    );
};


export default LogComponent

const LOADING = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <Spinner />
        <span className="text-xs">{text}</span>
    </div>
);


const AuthError = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <AlertCircle className="w-8 h-8 text-gray-300" />
        <span className="text-xs">Please log in to view server logs.</span>
    </div>
);

const ApiError = ({ error }: { error: unknown }) => (
    <div className="text-red-600 p-4 text-sm flex items-center justify-center border-b border-red-100">
        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
        {error instanceof Error ? error.message : "Failed to load logs"}
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-xs">No logs found.</span>
    </div>
);

const HelpModal = ({ helpText, onClose }: { helpText: string, onClose: () => void }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Help</h2>
            <p className="text-sm text-muted-foreground">{helpText}</p>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-muted text-sm rounded hover:bg-black hover:text-white focus:outline-none"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

const INIT = ({ onConnect }: { onConnect: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
        <div className="bg-gray-100 p-4 rounded-full">
            <Terminal className="w-8 h-8 text-gray-400" />
        </div>

        <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-900">Ready to Connect</p>
        </div>

        <button
            onClick={onConnect}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800"
        >
            Get Logs
        </button>
    </div>
);

const DATA = ({ items, isStale }: { items: LogEntry[], isStale: boolean }) => (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white max-h-[500px]">
        <div className={`transition-opacity duration-200 ${isStale ? 'opacity-50' : 'opacity-100'}`}>

            {items.map((log, index) => (
                <LogRow key={`${log.timestamp}-${index}`} log={log} />
            ))}

            {isStale && (
                <div className="p-2 text-center text-xs text-gray-400 italic">
                    Fetching more lines...
                </div>
            )}

        </div>
    </div>
);

export const HEADER = ({
    title,
    description,
    lineCount,
    onLineCountChange,
    onRefresh,
    isBusy,
    onHelpClick
}: LogHeaderProps) => {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const settingsRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <CardHeader className="bg-gray-100 mb-2">
            <div className="flex flex-row justify-between items-start">
                <div className="flex items-center gap-2">
                    <CardTitle>{title}</CardTitle>
                </div>

                <div className="flex items-center gap-4">

                    <div className="relative" ref={settingsRef}>
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="rounded-md hover:bg-gray-200 text-gray-600  disabled:opacity-50"
                        >
                            <Settings className="cursor-pointer w-4 h-4" />
                        </button>

                        {isSettingsOpen && (
                            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                {LOG_OPTIONS.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => {
                                            onLineCountChange(v);
                                            setIsSettingsOpen(false);
                                        }}
                                        className={`cursor-pointer w-full text-left px-3 py-2 text-xs hover:bg-gray-50 -colors
                                        ${lineCount === v ? "text-black font-semibold bg-gray-50" : "text-gray-600"}`}
                                    >
                                        {v} Lines
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={isBusy}
                        className="rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                    >
                        <RefreshCcw className={`cursor-pointer w-4 h-4`} />
                    </button>

                    {onHelpClick && (
                        <button
                            onClick={onHelpClick}
                            className="rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 "
                        >
                            <Info className="w-4 h-4 cursor-pointer" />
                        </button>
                    )}
                </div>
            </div>
            <CardDescription>{description}</CardDescription>

        </CardHeader>
    );
};
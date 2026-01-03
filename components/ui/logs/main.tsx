import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Check, Copy, Info, RotateCcw } from "lucide-react";
import Spinner from "../Spinner";
import { LogEntry, useLogs } from "@/lib/component-utils/logUtils";

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

    const {
        data: logs,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        isPlaceholderData // True if showing old data while fetching new count
    } = useLogs(address, lineCount.toString(), isFallback);
    
    const isBusy = isLoading || isRefetching;
    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">
                <CardHeader className="bg-gray-100 mb-2">
                     <div className="flex flex-row justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            
                            {/* --- LINE COUNT SELECTOR --- */}
                            <div className="flex items-center bg-white border rounded px-2 py-1 h-[26px]">
                                <span className="text-[10px] text-gray-400 mr-2 font-medium uppercase tracking-wider">Lines</span>
                                <select 
                                    value={lineCount}
                                    onChange={(e) => setLineCount(Number(e.target.value))}
                                    disabled={isBusy}
                                    className="text-xs bg-transparent border-none outline-none text-gray-700 font-medium cursor-pointer disabled:opacity-50"
                                >
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                    <option value={300}>300</option>
                                    <option value={400}>400</option>
                                    <option value={500}>500</option>
                                </select>
                            </div>

                            <button
                                onClick={() => refetch()}
                                disabled={isBusy}
                                className="flex items-center gap-1 h-[26px] text-xs bg-white border px-3 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isBusy ? 'Loading...' : 'Refresh'}
                            </button>

                            {help && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={address ? true : false} // this is hacky
                                    className="text-gray-400 hover:text-gray-700 focus:outline-none ml-1"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                </CardHeader>
                <CardContent className="py-2 px-4 border-b last:border-0">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
                        {isError && (
                        <div className="bg-red-50 text-red-600 p-2 text-xs flex items-center justify-center border-b border-red-100">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error instanceof Error ? error.message : "Failed to load logs"}
                        </div>
                    )}

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white flex-1">
                        
                        {/* INITIAL LOADING (First mount only) */}
                        {isLoading ? (
                           <Spinner />
                        ) : logs && logs.items.length > 0 ? (
                
                            <div className={`transition-opacity duration-200 ${isRefetching || isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
                                {logs.items.map((log, index) => (
                                    <LogRow key={`${log.timestamp}-${index}`} log={log} />
                                ))}
                                
                                {isPlaceholderData && (
                                    <div className="p-2 text-center text-xs text-gray-400 italic">
                                        Fetching more lines...
                                    </div>
                                )}
                            </div>
                            
                        ) : (
                            !isError && (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                    <span className="text-xs">No logs found.</span>
                                </div>
                            )
                        )}
                    </div>
                    </div>
                    {help && isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                <h2 className="text-lg font-bold mb-4">Help</h2>
                                <p className="text-sm text-muted-foreground">{help}</p>
                                <div className="mt-10 flex justify-end">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-muted text-sm rounded hover:bg-black hover:text-white focus:outline-none"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
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
            case 'ERROR': return 'text-red-600 bg-red-100 border-red-200';
            case 'WARN': return 'text-amber-600 bg-amber-100 border-amber-200';
            default: return 'text-emerald-600 bg-emerald-100 border-emerald-200';
        }
    };

    return (
        <div
            onClick={handleCopy}
            className="group flex items-start gap-3 p-2 text-xs border-b border-gray-100 hover:bg-gray-50 cursor-pointer font-mono"
        >
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 uppercase ${getLevelStyle(log.level)}`}>
                {log.level}
            </span>

            <div className="flex-1 min-w-0">

                {log.src && (
                    <span className="text-gray-400 text-xs mr-2 select-none">
                        [{log.src.split('.').slice(-2).join('.')}]
                    </span>
                )}

                <span className="text-gray-700 break-all group-hover:text-gray-900">
                    {log.message}
                </span>
            </div>

            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                )}
            </div>
        </div>
    );
};


export default LogComponent
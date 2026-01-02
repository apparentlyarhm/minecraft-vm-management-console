import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, Copy, Info } from "lucide-react";
import Spinner from "../Spinner";

type LogEntry = {
    timestamp: string;
    level: string;
    src: string;
    message: string;
};

const FALLBACK: LogEntry[] = [
    {
        "timestamp": "02Jan2026 17:15:11.405",
        "level": "INFO",
        "src": "net.minecraft.server.MinecraftServer/",
        "message": ": ligmahbulls has made the advancement [Cobweb Entanglement]"
    },
    {
        "timestamp": "02Jan2026 17:15:11.405",
        "level": "INFO",
        "src": "net.minecraft.server.MinecraftServer/",
        "message": ": Karma0o7 fell from a high place"
    },
    {
        "timestamp": "02Jan2026 17:15:11.405",
        "level": "WARN",
        "src": "gravestone/",
        "message": ": The death ID of player Karma0o7 is 10a665a3-f0ce-4273-8868-17f3c6f7e2e1"
    },
    {
        "timestamp": "02Jan2026 17:15:11.405",
        "level": "ERROR",
        "src": "pingwheel/",
        "message": ": Channel update: ligmahbulls -> default"
    },
    
]

const LogComponent = ({
    title,
    description,
    help,
    value,
    isFallback // this boolean keeps the UI stable when the backend is down. all components have this
}: {
    title: string;
    description: string;
    help?: string;
    value: string;
    isFallback: boolean
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    const logs = isFallback ? FALLBACK : null; 

    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">
                <CardHeader className="bg-gray-100 mb-2">
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle>{title}</CardTitle>

                        </div>
                        {help && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-muted-foreground hover:text-foreground focus:outline-none"
                                aria-label="Help"
                            >
                                <Info className="w-5   h-5 cursor-pointer" />
                            </button>
                        )}
                    </div>
                    <CardDescription>{description}</CardDescription>

                </CardHeader>
                <CardContent className="py-2 px-4 border-b last:border-0">
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
                        {logs && logs.length > 0 ? (
                            logs.map((log, index) => (
                                <LogRow key={index} log={log} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                <span className="text-xs">Fetching logs...</span>
                            </div>
                        )}
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
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CloudDownload, Download, FileText, Info, RefreshCcw, Search } from "lucide-react";
import Spinner from "./Spinner";
import { getDownloadLink, ModsResponse, useModList } from "@/lib/component-utils/motdApiUtils";
import { useToast } from "../context/ToastContext";

interface ModHeaderProps {
    title: string;
    description: string;
    onRefresh: () => void;
    isBusy: boolean;
    onHelpClick?: () => void;
}


const ModListComponent = ({
    title,
    description,
    help,
    value,
    isFallback, // this boolean keeps the UI stable when the backend is down. all components have this
}: {
    title: string;
    description: string;
    help?: string;
    value: string;
    isFallback: boolean;
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [confirmingFile, setConfirmingFile] = React.useState<string | null>(null);

    const [token, setToken] = React.useState<string | null>(null);
    const [isTokenLoaded, setIsTokenLoaded] = React.useState(false);

    const [hasInitiated, setHasInitiated] = React.useState(false);
    const { error: ToastError, info } = useToast();

    const handleDownloadProcess = async () => {
        if (!confirmingFile) return;

        // 1. Fallback / Demo Mode
        if (isFallback) {
            window.open("https://www.youtube.com/watch?v=5YI9noRIjwo", "_blank");
            setConfirmingFile(null);
            return;
        }

        try {
            const res = await getDownloadLink(confirmingFile, token);
            const link = res.message;

            if (typeof link === "string" && /^https:\/\/[^\s]+$/.test(link)) {
                const a = document.createElement("a");
                a.href = link;
                a.download = "";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                info({
                    heading: "Download Started",
                    message: "Link expires in 5 minutes.",
                    duration: 4000
                });
            } else {
                throw new Error("Invalid download link received");
            }
        } catch (err) {
            ToastError({
                heading: "Download Failed",
                message: err instanceof Error ? err.message : "Unknown error",
                duration: 4000
            });
        } finally {
            setConfirmingFile(null);
        }
    };

    React.useEffect(() => {
        const stored = localStorage.getItem("app_token");
        setToken(stored);
        setIsTokenLoaded(true);
    }, []);
    const {
        data: mods,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        
    } = useModList(isFallback, token, hasInitiated)

    const renderContent = () => {
        if (!isTokenLoaded) return <LOADING text="Initializing..." />;
        if (!token) return <AuthError />;

        if (!hasInitiated) {
            return <INIT onConnect={() => setHasInitiated(true)} />;
        }

        if (isError) return <ApiError error={error} />;
        if (isLoading) return <LOADING text="Fetching logs..." />;
        if (!mods) return <EmptyState />;

        return (
            <DATA
                items={mods}
                onDownloadClick={(file) => setConfirmingFile(file)}
            />
        );
    };
        const isBusy = isLoading || isRefetching;

    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">

                <HEADER
                    title={title}
                    description={description}
                    isBusy={isBusy}
                    onRefresh={refetch}
                    onHelpClick={help ? () => setIsModalOpen(true) : undefined}
                />

                <CardContent>
                    {renderContent()}
                </CardContent>

            </Card>

            {confirmingFile && (
                <CONFIRM_MODAL
                    filename={confirmingFile}
                    onConfirm={handleDownloadProcess}
                    onCancel={() => setConfirmingFile(null)}
                />
            )}

            {help && isModalOpen && (
                <HelpModal helpText={help} onClose={() => setIsModalOpen(false)} />
            )}
        </TabsPrimitive.TabsContent>
    );
};


export { ModListComponent as ModList };


const CONFIRM_MODAL = ({
    filename,
    onConfirm,
    onCancel,
}: {
    filename: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Confirm your download</h2>
            <p className="text-sm text-muted-foreground">
                Do you really want to download `{filename}`? The link will only be available for 5 minutes.
            </p>
            <div className="mt-10 gap-2 flex justify-end">
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-muted cursor-pointer text-sm rounded-3xl hover:bg-blue-700 hover:text-white focus:outline-none"
                >
                    Download
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-muted text-sm cursor-pointer rounded-3xl hover:bg-black hover:text-white focus:outline-none"
                >
                    Go back
                </button>
            </div>
        </div>
    </div>
);


export const HEADER = ({
    title,
    description,
    onRefresh,
    isBusy,
    onHelpClick
}: ModHeaderProps) => {

    return (
        <CardHeader className="bg-gray-100 mb-2">
            <div className="flex flex-row justify-between items-start">
                <div className="space-y-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>

                <div className="flex items-center gap-1">

                    <button
                        onClick={onRefresh}
                        disabled={isBusy}
                        className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                    >
                        <RefreshCcw className={`cursor-pointer w-4 h-4`} />
                    </button>

                    {onHelpClick && (
                        <button
                            onClick={onHelpClick}
                            className="p-2 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 "
                        >
                            <Info className="w-5 h-5 cursor-pointer" />
                        </button>
                    )}
                </div>
            </div>
        </CardHeader>
    );
};

const LOADING = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <Spinner />
        <span className="text-xs">{text}</span>
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


const AuthError = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <AlertCircle className="w-8 h-8 text-gray-300" />
        <span className="text-xs">Please log in to view available mods / download them</span>
    </div>
);

const ApiError = ({ error }: { error: unknown }) => (
    <div className="text-red-600 p-4 text-sm flex items-center justify-center border-b border-red-100">
        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
        {error instanceof Error ? error.message : "Failed to get ModList"}
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-xs">No logs found.</span>
    </div>
);

const INIT = ({ onConnect }: { onConnect: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
        <div className="bg-gray-100 p-4 rounded-full">
            <CloudDownload className="w-8 h-8 text-gray-400" />
        </div>

        <div className="text-center space-y-1">
            <p className="text-sm font-medium text-gray-900">Ready to Fetch</p>
            <p className="text-xs text-gray-400 max-w-[200px]">
                Need to fetch modlist before downloading any.
            </p>
        </div>

        <button
            onClick={onConnect}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800"
        >
            Get List of mods
        </button>
    </div>
);

export const DATA = ({
    items,
    onDownloadClick
}: {
    items: ModsResponse,
    onDownloadClick: (filename: string) => void
}) => {
    const modList = items.mods

    const [search, setSearch] = React.useState('');
    const [expanded, setExpanded] = React.useState(false);

    const filteredItems = React.useMemo(() =>
        modList.filter(item => item.toLowerCase().includes(search.toLowerCase())),
        [items, search]
    );

    const isSearching = search !== '';

    const visibleItems = React.useMemo(() => {
        if (isSearching || expanded) return filteredItems;
        return filteredItems.slice(0, 10);
    }, [filteredItems, isSearching, expanded]);

    const canShowMore = !isSearching && filteredItems.length > 10;

    return (
        <div className="flex flex-col gap-4">
            
            <div className="relative">
                <input
                    type="text"
                    placeholder={`Search ${modList.length} mods...`}
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setExpanded(false);
                    }}
                    className="pl-9 pr-4 py-5 mt-3 text-sm border rounded-full w-full bg-gray-50 focus:bg-white focus:ring-1 focus:ring-black outline-none transition-all"
                />
            </div>

            {visibleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                    No mods match your search.
                </div>
            ) : (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-2">
                    {visibleItems.map((filename) => (
                        <div
                            key={filename}
                            className="group flex items-center justify-between p-3 bg-white border rounded-lg hover:border-gray-400 cursor-pointer"
                            onClick={(e) => {
                                    e.stopPropagation(); // Prevent bubbling
                                    onDownloadClick(filename);
                                }}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-gray-100 rounded-md text-gray-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 truncate" title={filename}>
                                    {filename}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {canShowMore && (
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        {expanded ? (
                            <> Show Less</>
                        ) : (
                            <> Show All ({modList.length})</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

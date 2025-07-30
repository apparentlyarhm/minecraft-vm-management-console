import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Download, ShieldQuestion } from "lucide-react";
import Spinner from "./Spinner";
import { getDownloadLink } from "@/lib/component-utils/motdApiUtils";
import { useToast } from "../context/ToastContext";


const ModList = ({
    value,
    title,
    description,
    items,
    updatedAt,
    isLoading,
    help,
}: {
    value: string;
    title: string;
    description: string;
    items: string[];
    isLoading: boolean;
    help?: string;
    updatedAt?: string
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [confirmingFile, setConfirmingFile] = React.useState<string | null>(null);
    const [expanded, setExpanded] = React.useState(false)
    const dataForDisplay = expanded ? items : items.slice(0, 10)
    const { success, error, info } = useToast();

    return (
        <TabsPrimitive.TabsContent value={value} className="mt-2 space-y-4 pt-4">
            <Card className="min-h-[400px]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CardTitle>{title}</CardTitle>
                        {help && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-muted-foreground hover:text-foreground focus:outline-none"
                                aria-label="Help"
                            >
                                <ShieldQuestion className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <CardDescription>{description}</CardDescription>

                    {updatedAt && (
                        <p className="text-sm font-bold text-green-800 mt-1">
                            Last updated: {new Date(updatedAt).toUTCString()} | Current UTC: {new Date().toUTCString()}
                        </p>
                    )}

                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Spinner />
                    ) : dataForDisplay.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">No items found.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                {dataForDisplay.map((item, idx) => (
                                    <div
                                        key={`${item}-${idx}`}
                                        onClick={() => setConfirmingFile(item)}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border rounded-md"
                                    >
                                        <span className="text-sm text-foreground break-all">{item}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => alert("Upcoming feature!")}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <button className="text-sm text-muted-foreground hover:text-gray-900 cursor-pointer" type="button" onClick={() => setExpanded(!expanded)}>
                                    {expanded ? 'Show Less' : `Show all ${items.length} items`}
                                </button>
                            </div>
                        </div>

                    )}
                </CardContent>

            </Card>

            {confirmingFile && (
                <ConfirmationModal
                    filename={confirmingFile}
                    onConfirm={() => {
                        getDownloadLink(confirmingFile)
                            .then((res) => {
                                const link = res.message;
                                if (typeof link === "string" && /^https:\/\/[^\s]+$/.test(link)) {
                                    const a = document.createElement("a");
                                    a.href = link;
                                    a.download = ""; // optionally: `${confirmingFile}`
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);

                                    success({
                                        heading: "Download started",
                                        message: "Your download link is valid for 5 minutes.",
                                        duration: 4000
                                    });
                                } else {
                                    error({
                                        heading: "Download failed",
                                        message: "Invalid or missing download link.",
                                        duration: 3000
                                    });
                                }
                            })
                            .catch((err) => {
                                error({
                                    heading: `Something went wrong while downloading ${confirmingFile}`,
                                    duration: 3000,
                                    message: `${err}`
                                })
                            })
                            .finally(() => {
                                setConfirmingFile(null)
                            })

                    }}
                    onCancel={() => setConfirmingFile(null)}
                />
            )}

            {isModalOpen && (
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
        </TabsPrimitive.TabsContent>
    );
};

const ConfirmationModal = ({
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


export { ModList };

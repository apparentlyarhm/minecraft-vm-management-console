import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Copy, Download, ShieldQuestion } from "lucide-react";
import Spinner from "./Spinner";


function getRelativeTime(timestamp: string): string {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const now = new Date();
    const updated = new Date(timestamp);
    const diff = (updated.getTime() - now.getTime()) / 1000; // in seconds

    const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
        [60, "second"],
        [60 * 60, "minute"],
        [60 * 60 * 24, "hour"],
        [60 * 60 * 24 * 7, "day"],
        [60 * 60 * 24 * 30, "week"],
        [60 * 60 * 24 * 365, "month"],
        [Infinity, "year"],
    ];

    for (const [rangeInSeconds, unit] of ranges) {
        if (Math.abs(diff) < rangeInSeconds) {
            const divisor = rangeInSeconds / (unit === "second" ? 1 : 60);
            return rtf.format(Math.round(diff / divisor), unit);
        }
    }

    return rtf.format(Math.round(diff / (60 * 60 * 24 * 365)), "year");
}


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

                    {updatedAt &&  (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                            Last updated: {getRelativeTime(updatedAt)}
                        </p>
                    )}

                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Spinner />
                    ) : items.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">No items found.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {items.map((item, idx) => (
                                <div
                                    key={`${item}-${idx}`}
                                    onClick={() => alert("Upcoming feature!")}
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
                    )}
                </CardContent>

            </Card>

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
        </TabsPrimitive.TabsContent>
    );
};

export { ModList };

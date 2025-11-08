import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ShieldQuestion } from "lucide-react";
import Spinner from "../Spinner";
import { Commands } from "./command-config";

const AdminComponent = ({
    players,
    isFallback,
    value,
    title,
    description,
    isLoading,
    help
}: {
    players: string[];
    isFallback: boolean;
    value: string;
    title: string;
    description: string;
    isLoading: boolean;
    help: string
}) => {
    const noPlayers = players.length === 0;
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

                </CardHeader>
                <CardContent className="py-2 px-4 border-b last:border-0">
                    {isFallback || isLoading ? (
                        <>
                            {isFallback && (
                                <p className="text-sm italic text-muted-foreground">
                                    You are viewing fallback data. No point in trying to execute commands.
                                </p>
                            )}
                            {isLoading && <Spinner />}
                        </>
                    ) : !noPlayers ? (
                        <p className="text-sm italic text-muted-foreground">No players found.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            {Commands.map((command) => (
                                <div key={command.key} className="flex flex-row justify-between p-4 border rounded-lg cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600">
                                    <div>
                                    <div className="flex items-center">
                                        <command.icon className="w-5 h-5 mr-2" />
                                        <h3 className="text-medium font-semibold">{command.name}</h3>
                                    </div>
                                    </div>
                                    <div>
                                        <ArrowUpRight className="w-7 h-7" />
                                    </div>
                                </div>
                            ))} 
                        </div>
                    )}

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

export default AdminComponent;
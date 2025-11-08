import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ShieldQuestion } from "lucide-react";
import Spinner from "../Spinner";

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
                    ) : noPlayers ? (
                        <p className="text-sm italic text-muted-foreground">No players found.</p>
                    ) : (
                        players.map((player) => (
                            <div key={player}>
                                {player}
                            </div>
                        ))
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
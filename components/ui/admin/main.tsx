import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, Check, Copy, ShieldQuestion } from "lucide-react";
import Spinner from "../Spinner";
import { Command, Commands } from "./command-config";
import { useState } from "react";
import { executeRCON } from "@/lib/component-utils/rconUtils";

const AdminComponent = ({
  players,
  address,
  isFallback,
  value,
  title,
  description,
  isLoading,
  help
}: {
  players: string[];
  address: string;
  isFallback: boolean;
  value: string;
  title: string;
  description: string;
  isLoading: boolean;
  help: string
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedCommand, setSelectedCommand] = React.useState<Command | null>(null);

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
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-5">
              {Commands.map((command) => (
                <div
                  key={command.key}
                  className="flex flex-row justify-between p-4 border rounded-lg cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600"
                  onClick={() => setSelectedCommand(command)}
                >
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

      {selectedCommand && (
        <ExecutionModal
          address={address}
          command={selectedCommand}
          players={players}
          onCancel={() => setSelectedCommand(null)}
        />
      )}

    </TabsPrimitive.TabsContent>
  )
}

type ExecutionModalProps = {
  command: Command;
  address: string;
  players: string[];
  onCancel: () => void;
};

const ExecutionModal = ({ command, players, onCancel, address }: ExecutionModalProps) => {
  const [argValues, setArgValues] = useState<string[]>(() => []);
  const [copiedPlayer, setCopiedPlayer] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<string>("");
  const [rconError, setRconError] = useState<string | null>(null);

  const t = localStorage.getItem("app_token") || ""
  const rconWrapper = async (command: Command, args: string[]) => {

    executeRCON(false, command.key, args, address, t)
      .then((data) => {
        setCommandResult(data.message);
      })
      .catch((e: Error) => {
        setRconError(e.message)
      });
  }

  const handleCopy = (player: string) => {
    navigator.clipboard.writeText(player);
    setCopiedPlayer(player);

    setTimeout(() => setCopiedPlayer(null), 1500);
  };

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...argValues];

    newArgs[index] = value;
    setArgValues(newArgs);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">
          <strong>{command.name}</strong>
        </h2>
        <p className="text-sm italic text-muted-foreground mb-4">
          {command.description}
        </p>

        <p className="text-sm text-muted-foreground mb-4">
          {"Also note that the output is not guaranteed to be returned for all custom commands so we will only show the raw response string from all commands below."}
        </p>

        <div className="mb-6">
          <ul className="border rounded-md divide-y divide-gray-200">
            {players.length > 0 ? (
              players.map((player, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center px-3 py-2 text-sm"
                >
                  <span>{player}</span>
                  <button
                    onClick={() => handleCopy(player)}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {copiedPlayer === player ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 px-3 py-2 italic">No players online</li>
            )}
          </ul>
        </div>

        {command.num_args > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Enter Arguments:</h3>
            <div className="space-y-2">
              {Array.from({ length: command.num_args }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={command.args[index] || `Argument ${index + 1}`}
                  value={argValues[index] || ""}
                  onChange={(e) => handleArgChange(index, e.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Output:</h3>
          <div className="space-y-2">
            <p className="w-full px-3 py-2 bg-gray-100 rounded-md text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">{commandResult}</p>
          </div>
        </div>

        {rconError && (
          <div className="text-sm mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {rconError}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 cursor-pointer text-sm rounded-3xl hover:bg-black hover:text-white focus:outline-none"
          >
            Go back
          </button>
          <button
            onClick={() => rconWrapper(command, argValues)}
            className="px-4 py-2 cursor-pointer bg-blue-100 text-sm rounded-3xl hover:bg-blue-700 hover:text-white focus:outline-none"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminComponent;
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, BrickWall, BrickWallFire, Check, Copy, Info, Pointer, Ratio, ShieldMinus } from "lucide-react";
import Spinner from "../Spinner";
import { Command, Commands } from "./command-config";
import { useState } from "react";
import { executeRCON } from "@/lib/component-utils/rconUtils";
import { initiateLogin } from "@/lib/component-utils/loginUtils";
import { makeServerPublic, purgeFirewall } from "@/lib/component-utils/firewallUtils";
import { useToast } from "@/components/context/ToastContext";

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
  const { success, error, info } = useToast(); // hook for the toasts

  // purge firewall state
  const [isPurging, setIsPurging] = useState(false);
  const [isMakingPublic, setIsMakingPublic] = useState(false);


  // admin functions other than rcon
  // both functions are similar and incomplete at the catch block
  const handlePurge = async () => {
    setIsPurging(true)

    const token = localStorage.getItem("app_token");

    if (!token) {
      await initiateLogin();
      return;
    }

    purgeFirewall(token) // didnt add the isFallback here because the button will be disabled entirely
      .then((message) => success({
        heading: "Purged",
        message: "All whitelisted IPs cleared!",
        duration: 3000,
      }
      ))
      .catch((err) => error({
        heading: "Failed to purge",
        message: `${err}`,
        duration: 6000,
      }))
      .finally(() => {
        setIsPurging(false)
      })
  };

  const handlePublic = async () => {
    setIsMakingPublic(true)

    const token = localStorage.getItem("app_token");

    if (!token) {
      await initiateLogin();
      return;
    }

    makeServerPublic(token)
      .then((message) => success({
        heading: "Done",
        message: "Server is public!",
        duration: 3000,
      }
      ))
      .catch((err) => error({
        heading: "Failed to change settings",
        message: `${err}`,
        duration: 6000,
      }))
      .finally(() => {
        setIsMakingPublic(false)
      })
  };

  // lets just keep a global constant
  const fallbackCommand: Command = {

    name: 'Test',
    description: 'This is how an actual command will look. Clicking execute will execute it on the server.',
    key: 'FALLBACK',
    args: [
      {
        name: 'parameter 1',
        placeholder: 'you will enter something here',
        type: 'string'
      }
    ],
    icon: Ratio

  }

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
          {isFallback || isLoading ? (
            <>
              {isFallback && (
                <div
                  key="sample-command"
                  className="flex flex-row justify-between items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600"
                  onClick={() => setSelectedCommand(fallbackCommand)}
                >
                  <div className="flex items-center">
                    <fallbackCommand.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <h3 className="text-sm sm:text-base font-semibold">{fallbackCommand.name}</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
              {isLoading && <Spinner />}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-lg">RCON</p>
              <div className="grid grid-cols-2 gap-5 mb-5">
                {Commands.map((command) => (
                  <div
                    key={command.key}
                    className="flex flex-row justify-between items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600"
                    onClick={() => setSelectedCommand(command)}
                  >
                    <div className="flex items-center">
                      <command.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <h3 className="text-sm sm:text-base font-semibold">{command.name}</h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                ))}
              </div>

              {/* we can probably refactor this better */}
              <p className="text-lg">Access Control</p>
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div
                  key="purge-firewall"
                  className="flex flex-row justify-between items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600"
                  onClick={handlePurge}
                >

                  <div className="flex items-center">

                    {isPurging ? (
                      <Spinner />
                    ) : (
                      <>
                        <BrickWallFire className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <h3 className="text-sm sm:text-base font-semibold">Purge Firewall</h3>
                      </>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />

                </div>

                <div
                  key="allow-public"
                  className="flex flex-row justify-between items-center p-3 sm:p-4 border rounded-xl cursor-pointer hover:bg-sky-100 hover:text-sky-900 hover:border-sky-600"
                  onClick={handlePublic}
                >

                  <div className="flex items-center">
                    {isMakingPublic ? (
                      <Spinner />
                    ) : (
                      <>
                        <ShieldMinus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <h3 className="text-sm sm:text-base font-semibold">Allow Public Access</h3>
                      </>
                    )}

                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />

                </div>
              </div>
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

    // lets keep it simple
    if (command.key == "FALLBACK") {
      alert("In a real scenario, you will not see this dialog, and command will execute (or login if required)")
      setCommandResult(".. and output will appear here, again, if any.")

      return
    }

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

  const showPlayerPicker = command.args.some(arg => arg.type === 'player');

  return (
    <div className="fixed inset-0 flex items-center justify-center transition-all bg-black/50 z-50">
      <div className="bg-white p-10 rounded-3xl shadow-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <h2 className="text-3xl font-black mb-2">
          {command.name}
        </h2>
        <p className="text-sm italic text-muted-foreground mb-4">
          {command.description}
        </p>

        <p className="text-sm bg-blue-100 p-4 rounded-lg text-blue-600  mb-4">
          {"Not all commands give output. This feature is recommended only for basic management commands and not for absolutely everything that can be run in console"}
        </p>

        {showPlayerPicker && (
          <div className="mb-6">
            <ul className="border rounded-md divide-y divide-gray-200">
              {players.length > 0 ? (
                players.map((player, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between hover:bg-gray-100 cursor-pointer items-center px-3 py-2 text-sm"
                    onClick={() => handleCopy(player)}
                  >
                    <span>{player}</span>
                    <button
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      {copiedPlayer === player ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                        </>
                      ) : (
                        <>
                          <Pointer className="w-4 h-4" />
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
        )}

        {command.args.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Need following inputs:</h3>

            <div className="space-y-4">
              {command.args.map((arg, index) => {
                const hasOptions = arg.options && arg.options.length > 0;
                const isStrict = hasOptions && arg.allowCustomInput === false;

                return (
                  <div key={index}>
                    {hasOptions && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {arg.options!.map((opt) => {
                          const isSelected = argValues[index] === opt;

                          return (
                            <button
                              key={opt}
                              onClick={() => handleArgChange(index, opt)}
                              className={`
                        px-3 py-1 text-sm rounded-lg border-1 cursor-pointer
                        ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-transparent text-gray-700 border-gray-300"}
                        hover:bg-gray-200 hover:text-gray-700
                      `}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {!isStrict && (
                      <>
                        <input
                          type="text"
                          placeholder={arg.placeholder || arg.name}
                          className="w-full p-3 border border-gray-300 rounded-xl text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange -400 placeholder-gray-300"
                          value={argValues[index] || ""}
                          onChange={(e) => handleArgChange(index, e.target.value)}
                        />

                        <p className="text-xs italic mt-1 text-gray-500">
                          fill this with the indicated value
                        </p>
                      </>
                    )}

                    {isStrict && (
                      <p className="text-xs italic text-gray-500">
                        Select one of the above options.
                      </p>
                    )}
                  </div>
                );
              })}
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

        <div className="mt-6 flex justify-between gap-2">
          <button
            onClick={onCancel}
            className="p-3 bg-gray-100 cursor-pointer text-sm rounded-3xl hover:bg-black hover:text-white focus:outline-none"
          >
            Go back
          </button>
          <button
            onClick={() => rconWrapper(command, argValues)}
            className="p-3 cursor-pointer bg-blue-100 text-sm rounded-3xl hover:bg-blue-700 hover:text-white focus:outline-none"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminComponent;
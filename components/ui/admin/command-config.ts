import { Clock, Cloud, FileQuestion, LucideProps, MousePointer2, Podcast, UserPlus, UserRoundX, UserX } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type Command = {
    name: string;
    description: string;
    key: string;
    num_args: number;
    args: string[];
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; // this is such a hack
}

export const Commands: Command[] = [
    { name: 'Kick', description: 'Kick a player from the server using their username.', key: 'KICK', num_args: 1, args: ['username'], icon:  UserRoundX },
    { name: 'Ban', description: 'Ban a player from the server using their username.', key: 'BAN', num_args: 1, args: ['username'], icon:  UserX },
    { name: 'Pardon', description: 'Unban a player from the server using their username.', key: 'PARDON', num_args: 1, args: ['username'], icon:  UserPlus },
    { name: 'Teleport', description: 'Teleports a player to anothers location.', key: 'TELEPORT', num_args: 2, args: ['player1', 'player2'], icon:  MousePointer2 },
    { name: 'Say', description: 'Broadcast a message to all players on the server.', key: 'SAY', num_args: 1, args: ['message'], icon:  Podcast },
    { name: 'Time Set', description: 'Sets the in-game time to a specific value.', key: 'TIME_SET', num_args: 1, args: ['time'], icon:  Clock },
    { name: 'Weather Set', description: 'Changes the in-game weather to a specified type.', key: 'WEATHER_SET', num_args: 1, args: ['weather_type'], icon:  Cloud },
    { name: 'Custom...', description: 'Enter a custom command', key: 'CUSTOM', num_args: 1, args: ['enter the entire thing here'], icon:  FileQuestion },
]
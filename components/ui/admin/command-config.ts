import { Clock, Cloud, DrumstickIcon, FileQuestion, LucideProps, MousePointer2, Podcast, UserPlus, UserRoundX, UserX } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type Command = {
  name: string;
  description: string;
  key: string;
  args: CommandArg[];
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>; // this is such a hack
}

export type CommandArg = {
  name: string;                             // ex: "mode", "player"
  placeholder?: string;                     // ex: "Select gamemode"
  options?: string[];                       // if present → render chips OR dropdown
  allowCustomInput?: boolean;               // false = chips only
  type?: "string" | "number" | "player";    // optional typing
  validator?: ValidatorFn;                  // its possible that not all inputs need same type of validations (or none at all)
};

export type ValidatorFn = (value: string) => boolean;


export const Commands: Command[] = [
  {
    name: 'Kick',
    description: 'Kick a player from the server using their username.',
    key: 'KICK',
    args: [
      { name: 'username', placeholder: 'username to be kicked', type: 'player' }
    ],
    icon: UserRoundX
  },

  {
    name: 'Ban',
    description: 'Ban a player from the server using their username.',
    key: 'BAN',
    args: [
      { name: 'username', placeholder: 'username to be banned', type: 'player' }
    ],
    icon: UserX
  },

  {
    name: 'Pardon',
    description: 'Unban a player from the server using their username.',
    key: 'PARDON',
    args: [
      { name: 'username', placeholder: 'username to be pardoned' }
    ],
    icon: UserPlus
  },

  {
    name: 'Teleport',
    description: 'Teleports a player to another player.',
    key: 'TELEPORT',
    args: [
      {
        name: 'player1',
        placeholder: 'Source player',
        type: 'player'
      },
      {
        name: 'player2',
        placeholder: 'Destination player',
        type: 'player'
      },
    ],
    icon: MousePointer2
  },

  {
    name: 'Say',
    description: 'Broadcast a message to all players on the server.',
    key: 'SAY',
    args: [
      {
        name: 'message',
        placeholder: 'Message to broadcast'
      }
    ],
    icon: Podcast
  },

  {
    name: 'Time Set',
    description: 'Sets the in-game time to a specific value.',
    key: 'TIME_SET',
    args: [
      {
        name: 'time',
        placeholder: 'Choose a time',
        options: ['day', 'noon', 'night', 'midnight'],
        allowCustomInput: false
      }
    ],
    icon: Clock
  },

  {
    name: 'Weather Set',
    description: 'Changes the weather.',
    key: 'WEATHER_SET',
    args: [
      {
        name: 'weather_type',
        placeholder: 'Weather type',
        options: ['clear', 'rain', 'thunder'],
        allowCustomInput: false
      }
    ],
    icon: Cloud
  },

  {
    name: 'Gamemode',
    description: 'Change the gamemode of a player',
    key: 'GAMEMODE',
    args: [
      {
        name: 'mode',
        placeholder: 'The target mode',
        options: ['creative', 'survival'],
        allowCustomInput: false,
        type: 'string'
      },
      {
        name: 'player',
        placeholder: 'player username',
        options: [],
        allowCustomInput: true,
        type: 'player'
      }
    ],
    icon: DrumstickIcon
  },

  {
    name: 'Custom...',
    description: 'Enter a full custom command.',
    key: 'CUSTOM',
    args: [
      {
        name: 'command',
        placeholder: 'full command',
        allowCustomInput: true
      }
    ],
    icon: FileQuestion
  },
];

export const validators = {
  strictUsername: (value: string): boolean => {
    // this validator is perfect for validating whether a supplied username is an
    // actual valid username or coordinates- which we dont want to pass through.
    
    // ~ is a placeholder for current value in minecraft coordinate system
    if (value == "~") {
      return false
    }

    // should not be a possible number
    if (!Number.isNaN(parseInt(value))) {
      return false
    }
    // if its a single, string | alphanumeric username, then splitting it using "" will be a single item always.
    return value.split(" ").length === 1
  }
}
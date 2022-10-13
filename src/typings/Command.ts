import {
<<<<<<< HEAD
  ChatInputApplicationCommandData,
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  PermissionResolvable,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";
import { DetailedActionNames, SimpleActionNames } from "./client";
=======
    ChatInputApplicationCommandData,
    Collection,
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    Message,
    PermissionResolvable,
} from "discord.js";
import {ExtendedClient} from "../structures/Client";
>>>>>>> master

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface SlashCommandRunArgs {
<<<<<<< HEAD
  client: ExtendedClient;
  interaction: ExtendedInteraction;
  args: CommandInteractionOptionResolver;
}

interface TextCommandRunArgs {
  client: ExtendedClient;
  message: Message;
  args: string[];
=======
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
}

interface TextCommandRunArgs {
    client: ExtendedClient;
    message: Message;
    args: string[];
>>>>>>> master
}

type SlashCommandRunFunction = (options: SlashCommandRunArgs) => any;
type TextCommandRunFunction = (options: TextCommandRunArgs) => any;

<<<<<<< Updated upstream
export type SlashCommandType = {
<<<<<<< HEAD
=======
export interface Command {
  name: string;
>>>>>>> Stashed changes
  userPermissions?: PermissionResolvable;
  cooldown?: number;
  ownerOnly?: boolean;
}

export type SlashCommandType = Command & {
  ephemeral?: boolean;
  consumeInstantly?: boolean;
  run: SlashCommandRunFunction;
} & ChatInputApplicationCommandData;

export type TextCommandType = Command & {
  aliases?: string[];
  run: TextCommandRunFunction;
};

export interface ActionCommandAdditionalOptions {
  name: SimpleActionNames | DetailedActionNames;
  gifs?: Array<string>;
}

export type ActionCommandType = ActionCommandAdditionalOptions &
  TextCommandType;
<<<<<<< Updated upstream

export type CooldownType = {
  [key: string]: Collection<string, number>;
=======
    userPermissions?: PermissionResolvable;
    cooldown?: number;
    ownerOnly?: boolean;
    ephemeral?: boolean;
    run: SlashCommandRunFunction;
} & ChatInputApplicationCommandData;

export type TextCommandType = {
    name: string;
    aliases?: string[];
    userPermissions?: PermissionResolvable;
    coolDown?: number;
    ownerOnly?: boolean;
    run: TextCommandRunFunction;
};

export type ActionCommandAdditionalOptions = {
    gifs?: Array<string>;
};

export type ActionCommandType = TextCommandType &
    ActionCommandAdditionalOptions;

export type CooldownType = {
    [key: string]: Collection<string, number>;
>>>>>>> master
};
=======
>>>>>>> Stashed changes

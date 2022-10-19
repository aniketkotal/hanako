import {
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

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

interface SlashCommandRunArgs {
  client: ExtendedClient;
  interaction: ExtendedInteraction;
  args: CommandInteractionOptionResolver;
}

interface TextCommandRunArgs {
  client: ExtendedClient;
  message: Message;
  args: string[];
  command: string;
}

type SlashCommandRunFunction = (options: SlashCommandRunArgs) => any;
type TextCommandRunFunction = (options: TextCommandRunArgs) => any;

export interface Command {
  name: string;
  userPermissions?: PermissionResolvable;
  cooldown?: number;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  dmOnly?: boolean;
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

import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  PermissionResolvable,
} from "discord.js";
import type { ExtendedClient } from "../structures/Client";
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

type SlashCommandRunFunction = (options: SlashCommandRunArgs) => Promise<void>;
type TextCommandRunFunction = (options: TextCommandRunArgs) => Promise<void>;

export enum CommandCategory {
  ACTION = "🤗 Action",
  ADMIN = "⚒️ Admin",
  FUN = "🎱 Fun",
  UTILITY = "🔧 Utility",
  OWNER = "🔐 Owner",
  INFO = "ℹ️ Info",
}

export interface Command {
  name: string;
  description?: string;
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
  category: CommandCategory;
  usage: string;
  examples: string[];
  aliases: string[];
  run: TextCommandRunFunction;
};

export interface ActionCommandAdditionalOptions {
  name: SimpleActionNames | DetailedActionNames;
  gifs?: Array<string>;
}

export type ActionCommandType = ActionCommandAdditionalOptions & TextCommandType;

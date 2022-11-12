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
import { GuildInterface } from "../db/schemas/Guild";

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
  guild: GuildInterface,
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

export interface CommandArgument {
  argument: string;
  category: SettingCategories;
  description: string;
  usage: Array<string>;
  run: (options: TextCommandRunArgs) => Promise<void>;
}

export enum SettingCategories {
  UTILITY = "Utility",
  MODERATION = "Moderation",
  OTHER = "Other",
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
  permissions: PermissionResolvable;
  run: TextCommandRunFunction;
};

export interface ActionCommandAdditionalOptions {
  name: SimpleActionNames | DetailedActionNames;
  gifs?: Array<string>;
}

export type ActionCommandType = ActionCommandAdditionalOptions &
  TextCommandType;

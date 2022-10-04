import {
  ChatInputApplicationCommandData, Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  Message,
  PermissionResolvable,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

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
}

type SlashCommandRunFunction = (options: SlashCommandRunArgs) => any;
type TextCommandRunFunction = (options: TextCommandRunArgs) => any;

export type SlashCommandType = {
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
  cooldown?: number;
  ownerOnly?: boolean;
  run: TextCommandRunFunction;
};

export type CooldownType = {
  [key: string]: Collection<string, number>
}

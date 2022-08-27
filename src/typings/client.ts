import { ApplicationCommandDataResolvable } from "discord.js";

export interface RegisterCommandsOptions {
  guildID?: string;
  commands: ApplicationCommandDataResolvable[];
}

export interface AdditionalData {
  constants?: any;
}

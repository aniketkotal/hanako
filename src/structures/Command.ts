import { SlashCommandType, TextCommandType } from "../typings/Command";

export class SlashCommand {
  constructor(commandOptions: SlashCommandType) {
    Object.assign(this, commandOptions);
  }
}

export class TextCommand {
  constructor(commandOptions: TextCommandType) {
    Object.assign(this, commandOptions);
  }
}
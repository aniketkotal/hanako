import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommandType } from "../../../typings/command";

const command: SlashCommandType = {
  name: "help",
  description: "See all commands provided by the bot",
  ownerOnly: true,
  ephemeral: true,
  options: [
    {
      name: "command",
      description: "The command you need help with",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ interaction, client }) => {
  },
};

export default command;

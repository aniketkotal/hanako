// import { APIEmbed } from "discord.js";
import { CommandCategory, TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "help",
  aliases: ["h"],
  category: CommandCategory.INFO,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  run: async ({ message }) => {
  },
};

export default command;

import { CommandCategory, TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "prefix",
  aliases: [],
  usage: "prefix set",
  examples: [],
  description: "Set prefix for your server",
  category: CommandCategory.ADMIN,
  run: async ({ message }) => {},
};

export default command;

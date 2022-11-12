import { CommandArgument, SettingCategories } from "../../../../../typings/command";

const arg: CommandArgument = {
  argument: "cooldown",
  usage: ["cooldown <seconds>"],
  description: "Set default cooldown for the server.",
  category: SettingCategories.UTILITY,
  run: async ({ message }) => {
    message.channel.send("hi");
  },
};

export default arg;

import { CommandArgument, SettingCategories } from "../../../../../typings/command";

const arg: CommandArgument = {
  argument: "hi",
  usage: [""],
  description: "=",
  category: SettingCategories.OTHER,
  run: async ({ message }) => {
    message.channel.send("hi");
  },
};

export default arg;

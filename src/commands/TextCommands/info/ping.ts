import { TextCommand } from "../../../structures/Command";

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
  run: async ({ args, message }) => {
    const res = await message.guild.members.search({ query: args.join(" ") });
    console.log(res);
    return "a";
  },
});

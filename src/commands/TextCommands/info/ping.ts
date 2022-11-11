import { CommandCategory, TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "ping",
  aliases: ["pong"],
  usage: "ping",
  examples: ["i'm sure you dont need an example..."],
  description: "Shows the bot's ping",
  category: CommandCategory.INFO,
  run: async ({ message }) => {
    const msg = await message.reply("🏓");
    await msg.react("🏓");
    let ping;
    if (message.editedTimestamp) ping = msg.createdTimestamp - message.editedTimestamp;
    else ping = msg.createdTimestamp - message.createdTimestamp;

    await msg.reactions.removeAll();
    await msg.edit(`🏓 **Response Time:** \`${ping}ms\``);
  },
};

export default command;

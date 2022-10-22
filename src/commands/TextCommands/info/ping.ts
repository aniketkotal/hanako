import { TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "ping",
  aliases: ["pong"],
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

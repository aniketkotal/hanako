import { TextCommand } from "../../../structures/Command";

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
  run: async ({ message }) => {
    const msg = await message.reply("🏓");
    await msg.react("🏓");
    let ping;
    if (message.editedTimestamp)
      ping = msg.createdTimestamp - message.editedTimestamp;
    else ping = msg.createdTimestamp - message.createdTimestamp;

    await msg.reactions.removeAll();
    await msg.edit(`🏓 **Response Time:** \`${ping}ms\``);
  },
});

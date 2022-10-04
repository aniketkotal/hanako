import { TextCommand } from "../../../structures/Command";

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
  run: async ({ client, message }) => {
    console.log(await client.getActionGIF("bite"));
    await message.reply(`Pong! \`${client.ws.ping}ms\``);
  },
});
import { Event } from "../../structures/Events";
import { client } from "../../index";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.DEFAULT_PREFIX)) return;
  if (message.author.discriminator === "0000") return;

  const args = message.content
    .slice(process.env.DEFAULT_PREFIX.length)
    .split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  const cmd = client.textCommands.find(
    (c) => c.name === command || c.aliases?.includes(command)
  );
  if (!cmd) return;

  if (cmd.ownerOnly && !client.owners.includes(message.author.id))
    return message.reply(client.constants.error_messages.OWNER_ONLY);

  try {
    await cmd.run({ client, message, args });
  } catch (e) {
    console.log(e);
  }
});
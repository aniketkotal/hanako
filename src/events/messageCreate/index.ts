import { Event } from "../../structures/Events";
import { client } from "../../index";
import parseMessage from "./modules/parseMessage";
import checkCooldown from "./modules/cooldown";

export default new Event("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.DEFAULT_PREFIX)) return;
  if (message.author.discriminator === "0000") return;
  console.log(message.content);
  const { args, command } = parseMessage(message);
  if (!command) return;

  const cmd = client.textCommands.find(
    (c) => c.name === command || c.aliases?.includes(command)
  );
  if (!cmd) return;

  const cooldown = checkCooldown(cmd, message.author.id, client);
  const { cooldown_message } = client.constants.client_configurations.cooldown;
  if (cooldown) {
    const cooldownMessage = cooldown_message
      .replace("{cooldown}", String(cooldown))
      .replace("{command}", cmd.name)
      .replace("{unit}", cooldown > 1 ? "seconds" : "second");
    return message.reply(cooldownMessage);
  }

  if (cmd.ownerOnly && !client.owners.includes(message.author.id))
    return message.reply(client.constants.error_messages.OWNER_ONLY);

  try {
    await cmd.run({ client, message, args });
  } catch (e) {
    console.log(e);
  }
});

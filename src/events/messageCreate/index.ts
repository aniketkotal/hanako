import { Event } from "../../structures/Events";
import { client } from "../../index";
import parseMessage from "./modules/parseMessage";
import checkCooldown from "./modules/cooldown";
import basicChecks from "./modules/basicChecks";
import { User } from "../../db/models/User";
import { sequelize } from "../../db";

export default new Event("messageCreate", async (message) => {
  if (!basicChecks(message)) return;

  const { args, command } = parseMessage(message);
  if (!command) return;

  let user = await User.findOne({ where: { userID: message.author.id } });
  if (!user) user = await User.create({ userID: message.author.id });
  if (user.botMeta.banned.isBanned) {
    const { error_messages } = client.constants;
    return message.reply(
      error_messages.BOT_BANNED.replace(
        "{reason}",
        user.botMeta.banned.banReason
      )
    );
  }

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

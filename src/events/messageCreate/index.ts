import { Message } from "discord.js";
import { client } from "../../index";
import parseMessage from "./modules/parseMessage";
import checkCooldown from "./modules/cooldown";
import checkAFK from "./modules/checkAFK";
import { User } from "../../db/schemas/User";
import { TextCommandType } from "../../typings/command";
import { Event } from "../../typings/event";

const event: Event<"messageCreate"> = {
  event: "messageCreate",
  run: async (message) => {
    if (!basicChecks(message)) return;
    const { args, command } = parseMessage(message);
    if (command !== "afk") await checkAFK(message).catch(console.log);
    if (!command) return;

    const cmd = client.textCommands.find((c) => c.name === command || c.aliases?.includes(command));
    if (!cmd) return;
    if (!(await checkIfProperChannel(message, cmd))) return;
    if (!(await checkIfHasPermissions(message, cmd))) return;

    let user = await User.findOne({ userID: message.author.id }).exec();
    if (!user) user = await new User({ userID: message.author.id }).save();

    if (user.botMeta.banned.isBanned) {
      await message.reply({
        content: client.constants.error_messages.BOT_BANNED.replace(
          "{reason}",
          user.botMeta.banned.banReason,
        ),
      });
      return;
    }

    const cooldown = checkCooldown(cmd, message.author.id, client);
    const { cooldown_message } = client.constants.client_configurations.cooldown;
    if (cooldown) {
      const cooldownMessage = cooldown_message
        .replace("{cooldown}", String(cooldown))
        .replace("{command}", cmd.name)
        .replace("{unit}", cooldown > 1 ? "seconds" : "second");
      await message.reply(cooldownMessage);
      return;
    }

    if (cmd.ownerOnly && !client.owners.includes(message.author.id)) {
      await message.reply(client.constants.error_messages.OWNER_ONLY);
      return;
    }

    try {
      await cmd.run({ client, message, args, command });
    } catch (e) {
      console.log(e);
    }
  },
};

const basicChecks = (message: Message) =>
  !(
    message.author.bot ||
    !message.content.startsWith(process.env.DEFAULT_PREFIX) ||
    message.author.discriminator === "0000"
  );

const checkIfProperChannel = async (message: Message, command: TextCommandType) => {
  if (command.dmOnly && message.inGuild()) {
    client.helpers.addAutoDeleteTimer(await message.reply(client.constants.error_messages.DM_ONLY));
    return false;
  }
  if (command.guildOnly && !message.inGuild()) {
    client.helpers.addAutoDeleteTimer(
      await message.reply(client.constants.error_messages.GUILD_ONLY),
    );
    return false;
  }
  return true;
};

const checkIfHasPermissions = async (message: Message, command: TextCommandType) => {
  if (!command.userPermissions) return true;
  if (message.member.permissions.has(command.userPermissions)) {
    return true;
  }
  await message.reply(client.constants.error_messages.NO_PERMISSIONS);
  return false;
};

export default event;

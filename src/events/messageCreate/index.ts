import { APIEmbed, Message, PermissionsBitField } from "discord.js";
import { client } from "../../index";
import parseMessage from "./modules/parseMessage";
import checkCooldown from "./modules/cooldown";
import checkAFK from "./modules/checkAFK";
import { User } from "../../db/schemas/User";
import { TextCommandType } from "../../typings/command";
import { Event } from "../../typings/event";
import logger from "../../structures/Logger";
import { Guild } from "../../db/schemas/Guild";

const { Flags } = PermissionsBitField;

const event: Event<"messageCreate"> = {
  event: "messageCreate",
  run: async (message) => {
    if (!await checkIfBotHasPermissions(message)) return;
    if (!basicChecks(message)) return;
    const { args, command } = parseMessage(message);
    if (command !== "afk") {
      await checkAFK(message).catch((e) => {
        const error = e as Error;
        logger.log({
          message: error.message,
          level: "error",
        });
      });
    }
    let guild = await Guild.findOne({ guildID: message.guildId });
    if (!guild) {
      guild = new Guild({ guildID: message.guildId });
      await guild.save();
    }

    if (!message.content.startsWith(guild.prefix || process.env.DEFAULT_PREFIX)) return;
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

    const cooldown = checkCooldown(cmd, message.author.id, client, guild);
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
      await cmd.run({ client, message, args, command, guild });
    } catch (e) {
      const error = e as Error;
      logger.log({
        message: error.message,
        level: "error",
      });
      console.log(e);
    }
  },
};

const basicChecks = (message: Message) =>
  !(message.author.bot || message.author.discriminator === "0000");

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

const checkIfBotHasPermissions = async (message: Message) => {
  const {
    constants: { embed_colours: { default: embedColor } },
  } = client;
  if (!message.inGuild()) return true;
  const botPermissions = message.channel.permissionsFor(client.user.id);

  const requiredPermissions = [
    Flags.SendMessages,
    Flags.EmbedLinks,
    Flags.ReadMessageHistory,
    Flags.UseExternalEmojis,
    Flags.AddReactions,
    Flags.ReadMessageHistory,
    Flags.AttachFiles,
  ];

  if (botPermissions.has(requiredPermissions)) {
    return true;
  }
  const missingPermissions = botPermissions.missing(requiredPermissions)
    .map((p) => `\`${p.replace(/_/g, " ")}\``)
    .join(", ");
  const embed: APIEmbed = {
    title: "Hanako is missing permissions!",
    description: `I am missing the following permissions: ${missingPermissions}.\n` +
      `Please give me the required permissions to function properly.`,
    color: parseInt(embedColor, 16),
  };
  await message.member.send({ embeds: [embed] });
  return false;
};

export default event;

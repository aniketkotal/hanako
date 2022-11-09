import { APIEmbed, Message } from "discord.js";
import dayjs from "dayjs";
import { AFK } from "../../../db/schemas/AFK";
import { CommandCategory, TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "afk",
  aliases: ["setafk"],
  usage: "afk <reason>",
  examples: ["afk", "afk I'm busy(not really i dont have friends)"],
  description: "Sets your AFK status",
  category: CommandCategory.INFO,
  run: async ({ message, args, client }) => {
    const urlRegex =
      /[(htps)?:/w.a-zA-Z0-9@%_+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;

    if (args.join(" ").match(urlRegex)) {
      await client.helpers.addAutoDeleteTimer(
        await message.reply(client.constants.global_messages.afk.no_links),
        25000,
      );
      return;
    }

    const afk = await AFK.findOne({
      userID: message.author.id,
      guildID: message.guildId,
    });

    const embed: APIEmbed = {
      color: parseInt(client.constants.embed_colours.default, 16),
    };

    if (!afk) {
      const nAfk = await new AFK({
        userID: message.author.id,
        guildID: message.guildId,
        message: args.join(" "),
        timestampSince: dayjs().unix(),
      }).save();
      embed.description = `<@${nAfk.userID}> is going AFK!\n`;
      if (nAfk.message) embed.description += `Reason: ${nAfk.message}`;
    } else {
      afk.timestampSince = dayjs().unix();
      afk.message = args.join(" ");
      embed.description = `Updated <@${afk.userID}>'s AFK message\n`;
      if (afk.message) embed.description += `Reason: ${afk.message}`;
      await afk.save();
    }
    await setAFKNickname(message);
    await message.reply({ embeds: [embed] });
  },
};
export default command;

const setAFKNickname = async (message: Message) => {
  if (!message.guild.members.me.permissions.has(134217728n) || !message.member.manageable) return;
  const { displayName } = message.member;
  if (displayName.endsWith(" [AFK]")) return;
  await message.member.setNickname(`${displayName} [AFK]`);
};

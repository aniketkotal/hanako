import { TextCommand } from "../../../structures/Command";
import { AFK } from "../../../db/schemas/AFK";
import dayjs from "dayjs";
import { APIEmbed, Message } from "discord.js";

export default new TextCommand({
  name: "afk",
  aliases: ["setafk"],
  run: async ({ message, args, client }) => {
    const urlRegex =
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

    if (args.join(" ").match(urlRegex)) {
      return client.helpers.addAutoDeleteTimer(
        await message.reply(client.constants.global_messages.afk.no_links),
        25000
      );
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
      embed.description += nAfk.message;
    } else {
      afk.timestampSince = dayjs().unix();
      afk.message = args.join(" ");
      embed.description = `Updated <@${afk.userID}>'s AFK message\n`;
      embed.description += afk.message;
      await afk.save();
    }
    await setAFKNickname(message);
    return message.reply({ embeds: [embed] });
  },
});

const setAFKNickname = async (message: Message) => {
  if (
    !message.guild.members.me.permissions.has(134217728n) ||
    !message.member.manageable
  )
    return;
  const displayName = message.member.displayName;
  if (displayName.endsWith(" [AFK]")) return;
  await message.member.setNickname(`${displayName} [AFK]`);
};

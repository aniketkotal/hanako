import { APIEmbed } from "discord.js";
import dayjs from "dayjs";
import { TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "sav",
  aliases: ["savatar", "spfp", "serveravatar"],
  async run({ message, args, client }) {
    const query = args[0]?.match(/\d{17,19}/)?.[0] || message.member.id;

    if (!query && args[0]) {
      return client.helpers.replyMessageWithError(
        message,
        client.constants.error_messages.INVALID_USER_ID,
      );
    }
    const user = await message.guild.members.fetch({
      force: true,
      user: query,
    });

    if (!user && args[0]) {
      return client.helpers.replyMessageWithError(
        message,
        client.constants.error_messages.NO_USER_FOUND,
      );
    }

    const embed: APIEmbed = {
      title: `${user.nickname || user.user.username}'s Server Avatar`,
      image: { url: user.displayAvatarURL({ size: 4096 }) },
      footer: {
        text: `Requested By: ${message.author.username}`,
        icon_url: message.author.displayAvatarURL(),
      },
      timestamp: dayjs().toISOString(),
    };

    const msg = await message.reply({ embeds: [embed] });
    return client.helpers.deleteReactionCollector(msg, message.author.id);
  },
};

export default command;

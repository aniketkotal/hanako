import { APIEmbed, Message } from "discord.js";
import dayjs from "dayjs";
import { AFK } from "../../../db/schemas/AFK";
import { client } from "../../../index";

const { embed_colours, global_messages } = client.constants;

export default async (message: Message) => {
  await selfAFKCheck(message);
  await mentionAFKCheck(message);
};

const selfAFKCheck = async (message: Message) => {
  const afk = await AFK.findOne({
    userID: message.author.id,
    guildID: message.guildId,
  }).exec();
  if (!afk) return;
  const currentTime = dayjs();
  const afkTime = dayjs.unix(afk.timestampSince);

  const difference = currentTime.diff(afkTime, "minutes");
  if (difference < 3) return;

  const timeDiff = afkTime.from(currentTime, true);
  const embed: APIEmbed = {
    color: parseInt(embed_colours.default, 16),
    description: global_messages.afk.not_afk_message.replace("{time}", timeDiff),
  };
  const msg = await message.reply({ embeds: [embed] });
  await AFK.deleteOne({
    userID: message.author.id,
    guildID: message.guildId,
  }).exec();
  await client.helpers.deleteReactionCollector(msg, message.author.id);
};
const mentionAFKCheck = async (message: Message) => {
  const {
    mentions: { users },
  } = message;

  if (!users.size) return;
  const AFKs = await Promise.all(
    users.map((user) => AFK.findOne({ userID: user.id, guildID: message.guildId }).exec()),
  );
  const filteredAFKs = AFKs.filter((afk) => afk);
  const embeds = filteredAFKs.map((afk) => {
    const afkFor = dayjs.unix(afk.timestampSince).fromNow(true);
    const embed: APIEmbed = {
      color: parseInt(client.constants.embed_colours.default, 16),
      description: global_messages.afk.user_afk_message
        .replace("{user}", `<@${afk.userID}>`)
        .replace("{time}", afkFor)
        .replace("{reason}", afk.message),
    };
    return embed;
  });
  if (embeds.length) client.helpers.addAutoDeleteTimer(await message.reply({ embeds }), 60000);
};

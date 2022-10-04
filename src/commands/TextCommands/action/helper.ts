import { APIEmbed, Message } from "discord.js";
import { ActionCount } from "../../../db/schemas/ActionCounts";
import { client } from "../../../index";
import { DetailedAction, SimpleEmbed } from "../../../typings/client";

export const prepareSimpleEmbed = async (
  message: Message,
  action: string
): Promise<APIEmbed> => {
  const { embed_details } = client.constants.action_embeds[
    action
  ] as SimpleEmbed;
  const { color, title } = embed_details;
  const gif = await client.getActionGIF(action);
  return {
    title: title.replace("{}", message.author.username),
    color: parseInt(color, 16),
    image: {
      url: gif,
    },
  };
};

export const prepareDetailedEmbed = async (
  message: Message,
  action: string
): Promise<APIEmbed | false> => {
  const victimIDs = message.mentions.users;
  const data = client.constants.action_embeds[action] as DetailedAction;

  if (!data) return;
  const { embed_details } = data;

  if (victimIDs.size === 0) return false;
  // const victimIDs = mentions.filter((user) => user.id !== message.author.id);

  const gif = await client.getActionGIF(action);
  const authorUsername = message.author.username;

  let embed: APIEmbed;
  const { title, footer } = embed_details;

  if (victimIDs.size === 1) {
    const isAuthor = victimIDs.first().id === message.author.id;
    let user = await ActionCount.findOne({ userID: message.author.id });
    if (!user)
      user = await ActionCount.initialiseActionCountInDB(message.author.id);
    const currentActionCount = await user.increaseActionCountByOne(
      action,
      victimIDs.first().id
    );

    const victimUsername = victimIDs.first().username;
    const embed_title = isAuthor
      ? title.self.replace("{}", authorUsername)
      : title.normal
          .replace("{}", authorUsername)
          .replace("{}", victimUsername);
    embed = {
      title: embed_title,
      color: parseInt(embed_details.color, 16),
      image: {
        url: gif,
      },
    };
    embed.footer = {
      text: footer
        .replace("{}", !isAuthor ? victimUsername : "yourself")
        .replace("{}", currentActionCount.toString()),
    };
  } else {
    const allMentionsCombined =
      Array.from(message.mentions.users)
        .slice(0, -1)
        .map((i) => i[1].username)
        .join(", ") +
      " and " +
      message.mentions.users.last().username;
    embed = {
      title: title.normal
        .replace("{}", authorUsername)
        .replace("{}", allMentionsCombined),
      color: parseInt(embed_details.color, 16),
      image: {
        url: gif,
      },
    };
  }
  return embed;
};

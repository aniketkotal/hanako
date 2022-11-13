import type { APIEmbed } from "discord.js";
import { GuildMember } from "discord.js";
import { ActionCount } from "../../../db/schemas/ActionCounts";
import { DetailedActionNames, SimpleActionNames } from "../../../typings/client";
import type { ExtendedClient } from "../../../structures/Client";

const prepareSimpleInteractionEmbed = async (
  mention: GuildMember,
  action: SimpleActionNames,
  client: ExtendedClient,
  gifs?: Array<string>,
): Promise<APIEmbed> => {
  const { embed_details } = client.constants.action_embeds[action];
  const { color, title } = embed_details;
  const gif = gifs?.length
    ? gifs[Math.floor(Math.random() * gifs.length)]
    : await client.helpers.getActionGIF(action);
  return {
    title: title.replace("{author}", mention.user.username),
    color: parseInt(color, 16),
    image: {
      url: gif,
    },
  };
};

const prepareDetailedInteractionEmbed = async (
  mention: GuildMember,
  author: GuildMember,
  action: DetailedActionNames,
  client: ExtendedClient,
  gifs?: string[],
): Promise<APIEmbed> => {
  const data = client.constants.action_embeds[action];

  const { embed_details } = data;

  const gif = gifs?.length
    ? gifs[Math.floor(Math.random() * gifs.length)]
    : await client.helpers.getActionGIF(action);
  const authorUsername = author.displayName;

  const { title, footer } = embed_details;

  const isAuthor = mention.id === author.id;
  let user = await ActionCount.findOne({ userID: author.id });
  if (!user) {
    user = await ActionCount.initialiseActionCountInDB(author.id);
  }
  const currentActionCount = await user.increaseActionCountByOne(
    action,
    mention.id,
  );
  const victimUsername = mention.displayName;
  const embed_title = isAuthor
    ? title.self.replace("{author}", authorUsername)
    : title.normal
      .replace("{author}", authorUsername)
      .replace("{victim}", victimUsername);

  return {
    title: embed_title,
    color: parseInt(embed_details.color, 16),
    image: {
      url: gif,
    },
    footer: {
      text: footer
        .replace("{victim}", !isAuthor ? victimUsername : "yourself")
        .replace("{count}", String(currentActionCount))
        .replace("{t}", currentActionCount !== 1 ? "times" : "time"),
    },
  };
};

export default {
  prepareSimpleInteractionEmbed,
  prepareDetailedInteractionEmbed,
};

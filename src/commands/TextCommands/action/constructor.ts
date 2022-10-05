import { APIEmbed, Message } from "discord.js";
import { ActionCount } from "../../../db/schemas/ActionCounts";
import { client } from "../../../index";
import { DetailedAction, SimpleEmbed } from "../../../typings/client";
import { ActionCommandType } from "../../../typings/Command";

const commaFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export const prepareSimpleEmbed = async (
  message: Message,
  action: string,
  gifs?: Array<string>
): Promise<APIEmbed> => {
  const { embed_details } = client.constants.action_embeds[
    action
  ] as SimpleEmbed;
  const { color, title } = embed_details;
  const gif = gifs?.length
    ? gifs[Math.floor(Math.random() * gifs.length)]
    : await client.getActionGIF(action);
  return {
    title: title.replace("{author}", message.author.username),
    color: parseInt(color, 16),
    image: {
      url: gif,
    },
  };
};

export const prepareDetailedEmbed = async (
  message: Message,
  action: string,
  gifs?: string[]
): Promise<APIEmbed | false> => {
  const victimIDs = message.mentions.users;
  const data = client.constants.action_embeds[action] as DetailedAction;

  if (!data) return;
  const { embed_details } = data;

  if (victimIDs.size === 0) return false;

  const gif = gifs?.length
    ? gifs[Math.floor(Math.random() * gifs.length)]
    : await client.getActionGIF(action);
  const authorUsername = message.author.username;

  let embed: APIEmbed;
  const { title, footer } = embed_details;

  if (victimIDs.size === 1) {
    const isAuthor = victimIDs.first().id === message.author.id;
    let user = await ActionCount.findOne({ userID: message.author.id });
    if (!user)
      user = await ActionCount.initialiseActionCountInDB(message.author.id);
    const currentActionCount = +(await user.increaseActionCountByOne(
      action,
      victimIDs.first().id
    ));
    const victimUsername = victimIDs.first().username;
    const embed_title = isAuthor
      ? title.self.replace("{author}", authorUsername)
      : title.normal
          .replace("{author}", authorUsername)
          .replace("{victim}", victimUsername);
    embed = {
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
  } else {
    const allMentionsCombined = commaFormatter.format(
      Array.from(message.mentions.users).map(([, user]) => {
        if (user.id === message.author.id) return "themselves";
        return user.username;
      })
    );

    embed = {
      title: title.normal
        .replace("{author}", authorUsername)
        .replace("{victim}", allMentionsCombined),
      color: parseInt(embed_details.color, 16),
      image: {
        url: gif,
      },
    };

    if (message.mentions.users.has(message.author.id)) {
      embed.footer = {
        text: "themselves as well.. somehow..",
      };
    }
  }
  return embed;
};

export const constructAllActions = () => {
  const detailedActions: { [key: string]: Array<string> } = {
    bite: [],
    cuddle: [],
    dance: [],
    feed: [],
    hug: [],
    kiss: [],
    pat: [],
    poke: [],
    slap: [],
    tickle: [],
    fluff: [],
    lick: [],
    kick: [],
    shoot: [],
    stare: [],
    yeet: [],
  };

  const simpleActions: { [key: string]: Array<string> } = {
    blush: [],
    cry: [],
    smile: [],
    pout: [],
    sleep: [],
    think: [],
    wave: [],
  };

  const actions: Array<ActionCommandType> = [];

  for (const action in detailedActions) {
    const cmd: ActionCommandType = {
      name: action,
      aliases: [],
      async run({ client, message }) {
        const cmdProps = this as ActionCommandType;
        const embed = await prepareDetailedEmbed(
          message,
          cmdProps.name,
          cmdProps.gifs
        );
        const { error_messages } = client.constants.action_embeds[
          cmdProps.name
        ] as DetailedAction;

        if (!embed) return message.reply(error_messages.NO_USER);

        return message.reply({ embeds: [embed] });
      },
    };
    if (detailedActions[action].length)
      cmd["gifs"] = [...detailedActions[action]];

    actions.push(cmd);
  }

  for (const action in simpleActions) {
    actions.push({
      name: action,
      aliases: [],
      run: async ({ message }) => {
        const embed = await prepareSimpleEmbed(message, action);
        return message.reply({ embeds: [embed] });
      },
    });
  }

  return actions;
};

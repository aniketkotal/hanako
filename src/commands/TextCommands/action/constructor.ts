import { APIEmbed, Message } from "discord.js";
import { ActionCount } from "../../../db/schemas/ActionCounts";
import { client } from "../../../index";
<<<<<<< HEAD
import {
  DetailedAction,
  DetailedActionNames,
  SimpleActionNames,
} from "../../../typings/client";
=======
import { DetailedAction, SimpleEmbed } from "../../../typings/client";
>>>>>>> master
import { ActionCommandType } from "../../../typings/Command";

const commaFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export const prepareSimpleEmbed = async (
  message: Message,
<<<<<<< HEAD
  action: SimpleActionNames,
  gifs?: Array<string>
): Promise<APIEmbed> => {
  const { embed_details } = client.constants.action_embeds[action];
=======
  action: string,
  gifs?: Array<string>
): Promise<APIEmbed> => {
  const { embed_details } = client.constants.action_embeds[
    action
  ] as SimpleEmbed;
>>>>>>> master
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

<<<<<<< HEAD
const getUsers = async (
  message: Message,
  args: Array<string>
): Promise<Array<{ id: string; name: string }> | null> => {
  const {
    mentions: { members },
  } = message;
  if (members.size) {
    return members.map((i) => ({
      id: i.id,
      name: i.nickname || i.user.username,
    }));
  }
  if (!args.length) return;
  const usr = args[0];
  if (usr && usr.length === 18) {
    const { id, nickname, user } = await message.guild.members.fetch(usr);
    return [
      {
        id: id,
        name: nickname || user.username,
      },
    ];
  }
  const name = args.join(" ");
  const res = await message.guild.members.search({ query: name, limit: 1 });
  if (!res.size) return null;
  console.log(res);
  return res.map((i) => ({
    id: i.user.id,
    name: i.nickname || i.user.username,
  }));
};

export const prepareDetailedEmbed = async (
  message: Message,
  action: DetailedActionNames,
  args: Array<string>,
  gifs?: string[]
): Promise<APIEmbed | false> => {
  const mentions = await getUsers(message, args);
  if (!mentions) return false;

  const data = client.constants.action_embeds[action];
  if (!data) return;

  const { embed_details } = data;

  const gif = gifs?.length
    ? gifs[Math.floor(Math.random() * gifs.length)]
    : await client.getActionGIF(action);
  const authorUsername = message.member.nickname || message.author.username;
=======
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
>>>>>>> master

  let embed: APIEmbed;
  const { title, footer } = embed_details;

<<<<<<< HEAD
  if (mentions.length === 1) {
    const isAuthor = mentions[0].id === message.author.id;
    let user = await ActionCount.findOne({ userID: message.author.id });
    if (!user)
      user = await ActionCount.initialiseActionCountInDB(message.author.id);
    const currentActionCount = await user.increaseActionCountByOne(
      action,
      mentions[0].id
    );
    const victimUsername = mentions[0].name;
=======
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
>>>>>>> master
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
<<<<<<< HEAD
      mentions.map((user) => {
        if (user.id === message.author.id) return "themselves";
        return user.name;
=======
      Array.from(message.mentions.users).map(([, user]) => {
        if (user.id === message.author.id) return "themselves";
        return user.username;
>>>>>>> master
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
<<<<<<< HEAD
  const detailedActions: Record<DetailedActionNames, string[]> = {
=======
  const detailedActions: { [key: string]: Array<string> } = {
>>>>>>> master
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
<<<<<<< HEAD
    punch: [],
=======
>>>>>>> master
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

<<<<<<< HEAD
  for (const a in detailedActions) {
    const action = a as DetailedActionNames;
    const cmd: ActionCommandType = {
      name: action,
      aliases: [],
      async run({ client, message, args }) {
        const embed = await prepareDetailedEmbed(
          message,
          action,
          args,
          this.gifs
        );

        const { error_messages } = client.constants.action_embeds[
          this.name
=======
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
>>>>>>> master
        ] as DetailedAction;

        if (!embed) return message.reply(error_messages.NO_USER);

        return message.reply({ embeds: [embed] });
      },
    };
    if (detailedActions[action].length)
      cmd["gifs"] = [...detailedActions[action]];

    actions.push(cmd);
  }

<<<<<<< HEAD
  for (const a in simpleActions) {
    const action = a as SimpleActionNames;
=======
  for (const action in simpleActions) {
>>>>>>> master
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

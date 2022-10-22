import { BaseGuildTextChannel, Guild, Message } from "discord.js";
import axios from "axios";
import { client } from "../index";

const toTitleCase = (text: string) => {
  let str = text.replace(
    /([^\W_]+[^\s-]*) */g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );

  const lowers = [
    "A",
    "An",
    "The",
    "And",
    "But",
    "Or",
    "For",
    "Nor",
    "As",
    "At",
    "By",
    "For",
    "From",
    "In",
    "Into",
    "Near",
    "Of",
    "On",
    "Onto",
    "To",
    "With",
  ];
  for (let i = 0; i < lowers.length; i += 1) {
    str = str.replace(new RegExp(`\\s${lowers[i]}\\s`, "g"), (txt) => txt.toLowerCase());
  }

  const uppers = ["Id", "Tv"];
  for (let i = 0; i < uppers.length; i += 1) {
    str = str.replace(new RegExp(`\\b${uppers[i]}\\b`, "g"), uppers[i].toUpperCase());
  }

  return str;
};

const getMessage = async (
  messageID: string,
  channelID: string,
): Promise<Promise<Message> | undefined> => {
  const channel = (await client.channels.fetch(channelID)) as BaseGuildTextChannel;

  if (!channel) {
    throw new Error(`The channel(${channelID}) was not found! The collector is not removed.`);
  }
  const messages = await channel.messages.fetch({ limit: 5 });
  const message = messages.get(messageID);
  if (!message) return undefined;
  return message;
};

const getActionGIF = async (action: string): Promise<string | undefined> => {
  let url: number;
  const { common, purrbot, neko } = client.constants.gif_endpoints;
  if (common.includes(action)) url = 1;
  else if (purrbot.includes(action)) url = 2;
  else if (neko.includes(action)) url = 3;
  else return undefined;

  const purrBotURL = `https://purrbot.site/api/img/sfw/${action}/gif`; // .link
  const nekoBestURL = `https://nekos.best/api/v2/${action}`; // .url

  const randomNum = Math.floor(Math.random() * 2);

  switch (url) {
    case 1:
      if (randomNum === 0) return (await axios.get(purrBotURL))?.data.link;
      return (await axios.get(nekoBestURL))?.data.results[0].url;
    case 2:
      return (await axios.get(purrBotURL))?.data.link;
    case 3:
      return (await axios.get(nekoBestURL))?.data.results[0].url;
    default:
      return undefined;
  }
};

const findUsersFromGuild = ({ query, guild }: { query: string; guild: Guild }) =>
  guild.members.search({ query, limit: 1 });

const replyMessageWithError = async (message: Message, error: string): Promise<void> => {
  const msg = await message.reply(error);
  setTimeout(() => msg.delete(), 5000);
};

const deleteReactionCollector = async (message: Message, ownerID: string, emoji = "❌") => {
  await message.react(emoji);
  const reactionCollector = message.createReactionCollector({
    filter: (reaction, user) => reaction.emoji.name === emoji && user.id === ownerID,
    time: 30000,
    max: 1,
  });
  reactionCollector.on("collect", () => message.delete());
  reactionCollector.on("end", () => message.reactions.removeAll().catch(() => null));
};

const addAutoDeleteTimer = (message: Message, time = 10000) =>
  setTimeout(() => message.delete(), time);

export default {
  toTitleCase,
  getMessage,
  findUsersFromGuild,
  getActionGIF,
  replyMessageWithError,
  deleteReactionCollector,
  addAutoDeleteTimer,
};

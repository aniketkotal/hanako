import {
  ApplicationCommandDataResolvable,
  BaseGuildTextChannel,
  Client,
  ClientEvents,
  Collection,
  Guild,
  Message,
} from "discord.js";
import glob from "glob-promise";
import mongoose from "mongoose";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { addMovieNightCollector } from "src/commands/SlashCommands/utility/helpers";
import { MovieNights } from "src/db/schemas/MovieNights";
import axios from "axios";
import {
  DetailedAction,
  DetailedActionNames,
  RegisterCommandsOptions,
  SimpleActionNames,
} from "../typings/client";
import type { ActionCommandType, SlashCommandType, TextCommandType } from "../typings/command";
import constants from "../constants/constants.json";
import {
  prepareDetailedEmbed,
  prepareSimpleEmbed,
} from "../commands/TextCommands/action/constructor";
import { Event } from "../typings/event";
import logger from "./Logger";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Calcutta");

export class ExtendedClient extends Client {
  slashCommands: Collection<string, SlashCommandType> = new Collection();
  textCommands: Collection<string, TextCommandType> = new Collection();
  coolDowns: Collection<string, Collection<string, number>> = new Collection();
  constants = constants;
  owners = process.env.OWNER_IDS.split(",").map((owner) => owner.trim());
  helpers = {
    toTitleCase,
    getMessage,
    findUsersFromGuild,
    getActionGIF,
    replyMessageWithError,
    deleteReactionCollector,
    addAutoDeleteTimer,
  };

  constructor() {
    super({
      intents: 130863,
      allowedMentions: {
        repliedUser: false,
      },
    });
  }

  async start() {
    try {
      await this._registerModules();
      await ExtendedClient._connectToDB();
      await this.login(process.env.TOKEN);
      await this._updateCollectorTimings();
      ExtendedClient._constructAllActions();
    } catch (e) {
      const error = e as Error;
      logger.log({
        message: error.message,
        level: "error",
      });
    }
  }

  static async _connectToDB() {
    try {
      const { DB_URL } = process.env;
      await mongoose.connect(DB_URL);
      const db = mongoose.connection;
      db.on("connecting", () => {
        logger.log({
          message: "Connecting to DB...",
          level: "info",
        });
      });
      db.on("open", () => {
        logger.log({
          message: "Connected to DB!",
          level: "info",
        });
      });

      db.on("error", () => {
        throw new Error("Failed connecting to DB!");
      });
    } catch (e) {
      const error = e as Error;
      logger.log({
        message: error.message,
        level: "error",
      });
    }
  }

  async _updateCollectorTimings(): Promise<void> {
    const currentTime = dayjs().unix();

    const aliveNights = await MovieNights.getAliveMovieNights(currentTime);
    if (!aliveNights.length) return;

    const movieNights = aliveNights.map(async (night) => {
      const remainingTime = dayjs.unix(night.timeEnds).diff(dayjs(), "ms");
      return addMovieNightCollector(night.messageID, this, remainingTime, night.channelID);
    });

    try {
      await Promise.all(movieNights);
    } catch (e) {
      const error = e as Error;
      logger.log({
        message: error.message,
        level: "error",
      });
    }
  }

  static async _importFile<T>(filePath: string) {
    const a = await import(filePath);
    return a?.default as T;
  }

  private async _registerSlashCommands({ commands, guildID }: RegisterCommandsOptions) {
    if (guildID) await this.guilds.cache.get(guildID)?.commands.set(commands);
    else await this.application?.commands.set(commands);
  }

  private async _registerModules() {
    const start = process.hrtime();
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];
    const fileType = process.env.ENVIRONMENT === "dev" ? "ts" : "js";
    const [eventFiles, slashCommandFiles, textCommandFiles] = await Promise.all([
      glob(`/events/**/index.${fileType}`, {
        root: require.main?.path,
      }),
      glob(`/commands/SlashCommands/**/*.${fileType}`, {
        root: require.main?.path,
      }),
      glob(`/commands/TextCommands/**/*.${fileType}`, {
        root: require.main?.path,
      }),
    ]);

    await Promise.all(
      Object.values(textCommandFiles).map(async (filePath) => {
        const command = await ExtendedClient._importFile<TextCommandType>(filePath);
        if (!command?.name) return;
        this.textCommands.set(command.name, command);
        logger.log({
          message: `Command ${command.name}`,
          level: "loaded",
        });
      }),
    );

    await Promise.all(
      Object.values(slashCommandFiles).map(async (filePath) => {
        const command = await ExtendedClient._importFile<SlashCommandType>(filePath);
        if (!command?.name) return;
        this.slashCommands.set(command.name, command);
        slashCommands.push(command);
        logger.log({
          message: `Command ${command.name}`,
          level: "loaded",
        });
      }),
    );

    // REGISTERING CODED ACTION COMMANDS
    const actionCommands = constructAllActions();
    actionCommands.forEach((command) => {
      if (!command?.name) return;
      this.textCommands.set(command.name, command);
      logger.log({
        message: `Command ${command.name}`,
        level: "loaded",
      });
    });
    this.on("ready", async () => {
      await this._registerSlashCommands({
        commands: slashCommands,
      });
    });

    await Promise.all(
      Object.values(eventFiles).map(async (filePath) => {
        const { event, run } = await ExtendedClient._importFile<Event<keyof ClientEvents>>(
          filePath,
        );
        logger.log({
          message: `Event ${event}`,
          level: "loaded",
        });
        this.on(event, run);
      }),
    );

    const end = process.hrtime(start);
    logger.info(`Loaded all modules in ${end[0]}.${Math.floor(end[1] / 1000000)}s`);
  }

  private static _constructAllActions() {
    const detailedActions: Record<DetailedActionNames, string[]> = {
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
      punch: [
        "https://media.tenor.com/p_mMicg1pgUAAAAC/anya-forger-damian-spy-x-family.gif",
        "https://media.tenor.com/gmvdv-e1EhcAAAAC/weliton-amogos.gif",
        "https://media.tenor.com/SwMgGqBirvcAAAAC/saki-saki-kanojo-mo-kanojo.gif",
        "https://media.tenor.com/qDDsivB4UEkAAAAC/anime-fight.gif",
        "https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/girl-slap.gif",
        "https://media.tenor.com/o8RbiF5-9dYAAAAd/killua-hxh.gif",
        "https://media.tenor.com/ObgxhbfdVCAAAAAd/luffy-anime.gif",
      ],
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

    Object.keys(detailedActions).forEach((a) => {
      const action = a as DetailedActionNames;
      const cmd: ActionCommandType = {
        name: action,
        aliases: [],
        async run({ message, args }) {
          const embed = await prepareDetailedEmbed(message, action, args, this.gifs);

          const { error_messages } = constants.action_embeds[this.name] as DetailedAction;

          if (!embed) {
            await message.reply(error_messages.NO_USER);
            return;
          }

          await message.reply({ embeds: [embed] });
        },
      };
      if (detailedActions[action].length) cmd.gifs = [...detailedActions[action]];
      actions.push(cmd);
    });

    Object.keys(simpleActions).forEach((a) => {
      const action = a as SimpleActionNames;
      actions.push({
        name: action,
        aliases: [],
        run: async ({ message }) => {
          const embed = await prepareSimpleEmbed(message, action);
          await message.reply({ embeds: [embed] });
        },
      });
    });

    return actions;
  }
}

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
  const client = this as ExtendedClient;
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
  const client = this as ExtendedClient;
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

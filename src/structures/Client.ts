import {
  ApplicationCommandDataResolvable,
  BaseGuildTextChannel,
  Client,
  ClientEvents,
  Collection,
  Message,
  GatewayIntentBits,
} from "discord.js";
import glob from "glob-promise";
import { Constant, RegisterCommandsOptions } from "../typings/Client";
import { SlashCommandType, TextCommandType } from "../typings/Command";
import { Event } from "./Events";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/SlashCommands/utility/helpers";
import constants from "../constants/constants.json";
import axios from "axios";
import { constructAllActions } from "../commands/TextCommands/action/constructor";
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
import { ActionTextCommand } from "./Command";

const { Guilds, MessageContent, GuildMessages, GuildMembers } =
  GatewayIntentBits;
>>>>>>> master
=======
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Calcutta");
>>>>>>> Stashed changes

export class ExtendedClient extends Client {
  slashCommands: Collection<string, SlashCommandType> = new Collection();
  textCommands: Collection<string, TextCommandType> = new Collection();
  coolDowns: Collection<string, Collection<string, number>> = new Collection();
  constants: Constant = constants;
  owners = process.env.OWNER_IDS.split(",").map((owner) => owner.trim());

  constructor() {
    super({
<<<<<<< HEAD
      intents: 130863,
=======
      intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
>>>>>>> master
      allowedMentions: {
        repliedUser: false,
      },
    });
  }

  async start() {
    try {
      await this._registerModules();
      await this._connectToDB();
      await this.login(process.env.TOKEN);
      await updateCollectorTimings();
    } catch (e) {
      Logger.error(e as Error);
    }
  }

  async getMessage(
    messageID: string,
    channelID: string
<<<<<<< HEAD
  ): Promise<Promise<Message> | undefined> {
=======
  ): Promise<Message> | undefined {
>>>>>>> master
    const channel = (await this.channels.fetch(
      channelID
    )) as BaseGuildTextChannel;

    if (!channel) {
      throw new Error(
        `The channel(${channelID}) was not found! The collector is not removed.`
      );
    }
    const messages = await channel.messages.fetch({ limit: 5 });
    const message = messages.get(messageID);
    if (!message) return undefined;
    return message;
  }

<<<<<<< HEAD
  async getActionGIF(action: string): Promise<string | undefined> {
=======
  async getActionGIF(action: string): Promise<string> {
>>>>>>> master
    let url: number;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const { common, purrbot, neko } = this.constants.gif_endpoints;
    if (common.includes(action)) url = 1;
    else if (purrbot.includes(action)) url = 2;
    else if (neko.includes(action)) url = 3;
<<<<<<< HEAD
    else return undefined;
=======
>>>>>>> master

    const purrBotURL = `https://purrbot.site/api/img/sfw/${action}/gif`; // .link
    const nekoBestURL = `https://nekos.best/api/v2/${action}`; // .url

    const randomNum = Math.floor(Math.random() * 2);

    switch (url) {
      case 1:
        if (randomNum === 0) return (await axios.get(purrBotURL))?.data.link;
        else return (await axios.get(nekoBestURL))?.data.results[0].url;
      case 2:
        return (await axios.get(purrBotURL))?.data.link;
      case 3:
        return (await axios.get(nekoBestURL))?.data.results[0].url;
    }
  }

<<<<<<< HEAD
  toTitleCase(text: string) {
    let str = text.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless
    // they are the first or last words in the string
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
    for (let i = 0, j = lowers.length; i < j; i++) {
      str = str.replace(
        new RegExp("\\s" + lowers[i] + "\\s", "g"),
        function (txt) {
          return txt.toLowerCase();
        }
      );
    }

    // Certain words such as initialisms or acronyms should be left uppercase
    const uppers = ["Id", "Tv"];
    for (let i = 0, j = uppers.length; i < j; i++) {
      str = str.replace(
        new RegExp("\\b" + uppers[i] + "\\b", "g"),
        uppers[i].toUpperCase()
      );
    }

    return str;
  }

  private async _connectToDB() {
    try {
      const { DB_URL, DB_PORT, DB_NAME } = process.env;
      await mongoose.connect(`mongodb://${DB_URL}:${DB_PORT}/${DB_NAME}`);
=======
  private async _connectToDB() {
    try {
      const { dbURL, dbPort, dbName } = process.env;
      await mongoose.connect(`mongodb://${dbURL}:${dbPort}/${dbName}`);
>>>>>>> master
      const db = mongoose.connection;
      db.on("connecting", () => {
        Logger.info("Connecting to DB...");
      });
      db.on("open", () => {
        Logger.info("Connected to DB!");
<<<<<<< HEAD
      });

      db.on("error", () => {
        throw new Error("Failed connecting to DB!");
      });
=======
      });

      db.on("error", () => {
        throw new Error("Failed connecting to DB!");
      });
>>>>>>> master
    } catch (e) {
      Logger.error(e as Error);
    }
  }

  private async _importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  private async _registerSlashCommands({
    commands,
    guildID,
  }: RegisterCommandsOptions) {
    if (guildID) await this.guilds.cache.get(guildID)?.commands.set(commands);
    else await this.application?.commands.set(commands);
  }

  private async _registerModules() {
    const start = process.hrtime();
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];
    const [eventFiles, slashCommandFiles, textCommandFiles] = await Promise.all(
      [
        glob(`/events/**/index.ts`, {
<<<<<<< HEAD
          root: require.main?.path,
        }),
        glob(`/commands/SlashCommands/**/*.ts`, {
          root: require.main?.path,
        }),
        glob(`/commands/TextCommands/**/*.ts`, {
          root: require.main?.path,
=======
          root: require.main.path,
        }),
        glob(`/commands/SlashCommands/**/*.ts`, {
          root: require.main.path,
        }),
        glob(`/commands/TextCommands/**/*.ts`, {
          root: require.main.path,
>>>>>>> master
        }),
      ]
    );

    for (const filePath of textCommandFiles) {
      const command = (await this._importFile(filePath)) as TextCommandType;
      if (!command?.name) continue;
      this.textCommands.set(command.name, command);
      Logger.moduleLoaded(command.name);
    }

    for (const filePath of slashCommandFiles) {
      const command = (await this._importFile(filePath)) as SlashCommandType;
      if (!command?.name) continue;
      this.slashCommands.set(command.name, command);
      slashCommands.push(command);
      Logger.moduleLoaded(command.name);
    }

    // REGISTERING CODED ACTION COMMANDS
    const actionCommands = constructAllActions();
    actionCommands.forEach((command) => {
      if (!command?.name) return;
      this.textCommands.set(command.name, command);
<<<<<<< HEAD
      Logger.actionLoaded(command.name);
=======
      Logger.moduleLoaded(command.name);
>>>>>>> master
    });

    this.on("ready", async () => {
      await this._registerSlashCommands({
        commands: slashCommands,
      });
    });

    for (const filePath of eventFiles) {
      const { event, run } = (await this._importFile(filePath)) as Event<
        keyof ClientEvents
      >;
      this.on(event, run);
      Logger.eventLoaded(event);
    }
    const end = process.hrtime(start);
    Logger.info(
      `Loaded all modules in ${end[0]}.${Math.floor(end[1] / 1000000)}s`
    );
  }
}

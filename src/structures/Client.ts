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
import {
  CooldownType,
  SlashCommandType,
  TextCommandType,
} from "../typings/Command";
import { Event } from "./Events";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/SlashCommands/utility/helpers";
import constants from "../constants/constants.json";
import axios from "axios";
import { constructAllActions } from "../commands/TextCommands/action/constructor";
import { ActionTextCommand } from "./Command";

const { Guilds, MessageContent, GuildMessages, GuildMembers } =
  GatewayIntentBits;

export class ExtendedClient extends Client {
  slashCommands: Collection<string, SlashCommandType> = new Collection();
  textCommands: Collection<string, TextCommandType> = new Collection();
  coolDowns: Collection<string, CooldownType> = new Collection();
  constants: Constant = constants;
  owners = process.env.OWNER_IDS.split(",");

  constructor() {
    super({
      intents: [Guilds, MessageContent, GuildMessages, GuildMembers],
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
  ): Promise<Message> | undefined {
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

  async getActionGIF(action: string): Promise<string> {
    let url: number;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const { common, purrbot, neko } = this.constants.gif_endpoints;
    if (common.includes(action)) url = 1;
    else if (purrbot.includes(action)) url = 2;
    else if (neko.includes(action)) url = 3;

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

  private async _connectToDB() {
    try {
      const { dbURL, dbPort, dbName } = process.env;
      await mongoose.connect(`mongodb://${dbURL}:${dbPort}/${dbName}`);
      const db = mongoose.connection;
      db.on("connecting", () => {
        Logger.info("Connecting to DB...");
      });
      db.on("open", () => {
        Logger.info("Connected to DB!");
      });

      db.on("error", () => {
        throw new Error("Failed connecting to DB!");
      });
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
          root: require.main.path,
        }),
        glob(`/commands/SlashCommands/**/*.ts`, {
          root: require.main.path,
        }),
        glob(`/commands/TextCommands/**/*.ts`, {
          root: require.main.path,
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
      Logger.moduleLoaded(command.name);
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

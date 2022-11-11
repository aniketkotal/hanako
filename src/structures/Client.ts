import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import glob from "glob-promise";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { RegisterCommandsOptions } from "../typings/client";
import { SlashCommandType, TextCommandType } from "../typings/command";
import constants from "../constants/constants.json";
import utils from "./utils/index";
import { Event } from "../typings/event";
import logger from "./Logger";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Calcutta");

type Constants = typeof constants;
const { constructAllActions, connectToDB, updateAliveMovieNightsCollector, helpers } = utils;

export class ExtendedClient extends Client {
  slashCommands: Collection<string, SlashCommandType> = new Collection();
  textCommands: Collection<string, TextCommandType> = new Collection();
  coolDowns: Collection<string, Collection<string, number>> = new Collection();
  constants: Constants = constants;
  owners = process.env.OWNER_IDS.split(",").map((owner) => owner.trim());
  helpers = helpers;

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
      await connectToDB();
      await this.login(process.env.TOKEN);
      await updateAliveMovieNightsCollector(this);
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
}

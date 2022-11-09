import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import glob from "glob-promise";
import mongoose from "mongoose";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { RegisterCommandsOptions } from "../typings/client";
import { SlashCommandType, TextCommandType } from "../typings/command";
import { updateCollectorTimings } from "../commands/SlashCommands/utility/helpers";
import constants from "../constants/constants.json";
import { constructAllActions } from "../commands/TextCommands/action/constructor";
import ClientHelpers from "./ClientHelper";
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
  helpers = ClientHelpers;

  constructor() {
    super({
      intents: 130863,
      allowedMentions: {
        repliedUser: false,
      },
      presence: {
        status: "idle",
        activities: [{ name: "with myself", type: 1 }],
      },
    });
  }

  async start() {
    try {
      await this._registerModules();
      await ExtendedClient._connectToDB();
      await this.login(process.env.TOKEN);
      await updateCollectorTimings(this);
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

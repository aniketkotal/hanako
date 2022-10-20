import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import glob from "glob-promise";
import { RegisterCommandsOptions } from "../typings/Client";
import { SlashCommandType, TextCommandType } from "../typings/Command";
import { Event } from "./Events";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/SlashCommands/utility/helpers";
import constants from "../constants/constants.json";
import { constructAllActions } from "../commands/TextCommands/action/constructor";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import ClientHelpers from "./ClientHelper";

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

  private async _connectToDB() {
    try {
      const { DB_URL } = process.env;
      await mongoose.connect(DB_URL);
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
    const fileType = process.env.ENVIRONMENT === "dev" ? "ts" : "js";
    const [eventFiles, slashCommandFiles, textCommandFiles] = await Promise.all(
      [
        glob(`/events/**/index.${fileType}`, {
          root: require.main?.path,
        }),
        glob(`/commands/SlashCommands/**/*.${fileType}`, {
          root: require.main?.path,
        }),
        glob(`/commands/TextCommands/**/*.${fileType}`, {
          root: require.main?.path,
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
      Logger.actionLoaded(command.name);
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

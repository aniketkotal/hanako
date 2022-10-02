import {
  ApplicationCommandDataResolvable,
  BaseGuildTextChannel,
  Client,
  ClientEvents,
  Collection,
  Message,
} from "discord.js";
import glob from "glob-promise";
import globb from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { CommandType } from "../typings/Command";
import { Event } from "./Events";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/SlashCommands/utility/movienight/collectors";
import constants from "../constants/constants.json";

type JSONData = typeof constants;

const globPromise = promisify(globb);

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  constants: JSONData = constants;
  owners = process.env.botOwners.split(",");

  constructor() {
    super({ intents: 32767 });
  }

  async start() {
    try {
      await this._registerModules();
      await this._connectToDB();
      await this.login(process.env.botToken);
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

  private async _registerCommands({
    commands,
    guildID,
  }: RegisterCommandsOptions) {
    if (guildID) await this.guilds.cache.get(guildID)?.commands.set(commands);
    else await this.application?.commands.set(commands);
  }

  private async _registerModules() {
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/**/*{.ts,.js}`
    );

    for (const filePath of commandFiles) {
      const command = (await this._importFile(filePath)) as CommandType;
      if (!command?.name) continue;
      this.commands.set(command.name, command);
      slashCommands.push(command);
    }

    this.on("ready", async () => {
      await this._registerCommands({
        commands: slashCommands,
      });
    });

    const eventFiles = await glob(`/events/**/*{.ts,.js}`, {
      root: require.main.path,
    });
    for (const filePath of eventFiles) {
      const { event, run } = (await this._importFile(filePath)) as Event<
        keyof ClientEvents
      >;
      this.on(event, run);
    }
  }
}

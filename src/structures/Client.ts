import {
  ApplicationCommandDataResolvable,
  BaseGuildTextChannel,
  Client,
  ClientEvents,
  Collection,
  Message,
} from "discord.js";
import { glob } from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/Client";
import { CommandType } from "../typings/Command";
import { Event } from "./Events";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/utility/movienight/collectors";
import constants from "../constants/constants.json";
type JSONData = typeof constants;

const globPromise = promisify(glob);
export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  constants: JSONData = constants;

  constructor() {
    super({ intents: 32767 });
  }

  async start() {
    await this._registerModules();
    this._connectToDB();
    await this.login(process.env.botToken);
    await updateCollectorTimings();
  }

  async getMessage(
    messageID: string,
    channelID: string,
  ): Promise<Message> | undefined {
    const channel = (await this.channels.fetch(
      channelID,
    )) as BaseGuildTextChannel;

    if (!channel) {
      throw new Error(
        `The channel(${channelID}) was not found! The collector is not removed.`,
      );
    }
    const messages = await channel.messages.fetch({ limit: 5 });
    const message = messages.get(messageID);
    if (!message) return undefined;
    return message;
  }

  private _connectToDB() {
    mongoose
      .connect("mongodb://127.0.0.1:27017/hanakoDB")
      .then(() => {
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
      })
      .catch(e => {
        Logger.error(e as Error);
      });
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
      `${__dirname}/../commands/**/*{.ts,.js}`,
    );

    commandFiles.forEach(async filePath => {
      const command = (await this._importFile(filePath)) as CommandType;
      if (!command?.name) return;
      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on("ready", async () => {
      await this._registerCommands({
        commands: slashCommands,
      });
    });

    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async filePath => {
      const event = (await this._importFile(filePath)) as Event<
        keyof ClientEvents
      >;
      this.on(event.event, event.run);
    });
  }
}

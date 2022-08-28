import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import { glob } from "glob";
import { promisify } from "util";
import { AdditionalData, RegisterCommandsOptions } from "../typings/Client";
import { CommandType } from "../typings/Command";
import { Event } from "./Events";
import constants from "../constants/constants.json";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { updateCollectorTimings } from "../commands/utility/movienight/collectors";
const globPromise = promisify(glob);
export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  additionalData: AdditionalData;

  constructor() {
    super({ intents: 32767 });
  }

  start() {
    this._registerModules();
    this._addAdditionalData({ constants });
    this._connectToDB();
    this.login(process.env.botToken).then(() => {
      updateCollectorTimings();
    });
  }

  async getRandomItem(array: Object[]): Promise<any> {
    return await new Promise(resolve => {
      const res = array[Math.floor(Math.random() * array.length)];
      resolve(res);
    });
  }

  private _connectToDB() {
    mongoose.connect("mongodb://localhost:27017/hanakoDB");
    const db = mongoose.connection;
    db.on("error", () => {
      throw new Error("Failed connecting to DB!");
    });

    db.on("open", () => {
      Logger.info("Connected to DB!");
    });
  }

  private _addAdditionalData(data: AdditionalData): void {
    this.additionalData = data;
  }

  private async _importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  private async _registerCommands({
    commands,
    guildID,
  }: RegisterCommandsOptions) {
    if (guildID) {
      this.guilds.cache.get(guildID)?.commands.set(commands);
    } else {
      this.application?.commands.set(commands);
    }
  }

  private async _registerModules() {
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/**/*{.ts,.js}`,
    );

    commandFiles.forEach(async filePath => {
      const command: CommandType = await this._importFile(filePath);
      if (!command?.name) return;
      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on("ready", () => {
      this._registerCommands({
        commands: slashCommands,
      });
    });

    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async filePath => {
      const event: Event<keyof ClientEvents> = await this._importFile(filePath);
      this.on(event.event, event.run);
    });
  }
}

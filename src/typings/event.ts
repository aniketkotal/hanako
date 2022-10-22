import { ClientEvents } from "discord.js";

export interface Event<Key extends keyof ClientEvents> {
  event: Key;
  run: (...args: ClientEvents[Key]) => Promise<void>;
}

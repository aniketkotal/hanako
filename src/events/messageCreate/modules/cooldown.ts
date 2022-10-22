import { Collection, Snowflake } from "discord.js";
import dayjs from "dayjs";
import { ExtendedClient } from "../../../structures/Client";
import { Command } from "../../../typings/command";

export default function checkCooldown(
  command: Command,
  authorID: Snowflake,
  client: ExtendedClient,
) {
  const { coolDowns, constants } = client;
  const { cooldown } = constants.client_configurations;
  const { name } = command;

  if (client.owners.includes(authorID)) return false;

  if (!coolDowns.has(name)) coolDowns.set(name, new Collection());

  const now = dayjs();
  const cooldownsForCurrentCommand = coolDowns.get(name);
  const cooldownAmount = (command.cooldown || cooldown.default_cooldown) * 1000;

  if (!cooldownsForCurrentCommand.has(authorID)) {
    cooldownsForCurrentCommand.set(authorID, now.add(cooldownAmount, "ms").unix());
    setTimeout(() => cooldownsForCurrentCommand.delete(authorID), cooldownAmount);
    return false;
  }
  const expirationTime = dayjs.unix(cooldownsForCurrentCommand.get(authorID));
  if (now.isBefore(expirationTime)) return expirationTime.diff(now, "second");
  return false;
}

import { Message } from "discord.js";

export default function parseMessage(message: Message) {
  const args = message.content
    .slice(process.env.DEFAULT_PREFIX.length)
    .split(/ +/);
  const command = args.shift()?.toLowerCase();

  return { args, command };
}
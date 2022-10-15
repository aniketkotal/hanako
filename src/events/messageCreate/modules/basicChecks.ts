import { Message } from "discord.js";

export default (message: Message) =>
  !(
    message.author.bot ||
    !message.content.startsWith(process.env.DEFAULT_PREFIX) ||
    message.author.discriminator === "0000"
  );

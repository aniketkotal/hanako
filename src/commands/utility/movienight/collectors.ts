import { BaseGuildTextChannel, ComponentType } from "discord.js";
import { ExtendedClient } from "../../../structures/Client";
import { Logger } from "../../../structures/Logger";

const addCollector = async (
  messageID: string,
  channelID: string,
  client: ExtendedClient,
  time: number = 10000,
) => {
  try {
    const channel = client.channels.cache.get(
      channelID,
    ) as BaseGuildTextChannel;

    if (!channel)
      throw new Error(
        `The channel(${channelID}) was not found! The collector is not added.`,
      );

    const messages = await channel.messages.fetch({ limit: 5 });
    const message = messages.get(messageID);

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

    collector.on("collect", async i => {
      await i.deferReply({ ephemeral: true });
      console.log(i.customId);
      await i.followUp({
        content: `Your vote was submitted!`,
      });
    });

    collector.on("end", i => {
      console.log(i);
    });
  } catch (e) {
    Logger.error(e.message);
  }
};

export { addCollector };

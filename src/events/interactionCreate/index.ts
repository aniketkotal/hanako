import { APIEmbed, CommandInteractionOptionResolver } from "discord.js";
import { client } from "../../index";
import { Event } from "../../typings/event";
import { ExtendedInteraction } from "../../typings/command";
import { Guild } from "../../db/schemas/Guild";
import logger from "../../structures/Logger";

const {
  helpers: { errorEmbedBuilder, addAutoDeleteTimer, sendErrorToOwners },
} = client;

const event: Event<"interactionCreate"> = {
  event: "interactionCreate",
  run: async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.guildId) {
      await interaction.reply(client.constants.error_messages.GUILD_ONLY);
      return;
    }

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
      await interaction.reply("This command does not exists!");
      return;
    }

    let guild = await Guild.findOne({ guildID: interaction.guildId });
    if (!guild) {
      guild = new Guild({ guildID: interaction.guildId });
      await guild.save();
    }

    if (command.consumeInstantly) {
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
        guild,
      });
      return;
    }

    if (command.ownerOnly && !client.owners.includes(interaction.user.id)) {
      await interaction.reply({
        ephemeral: true,
        content: client.constants.error_messages.OWNER_ONLY,
      });
      return;
    }
    try {
      await interaction.deferReply({ ephemeral: command.ephemeral || false });
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
        guild,
      });
    } catch (e) {
      if (e instanceof Error) {
        logger.log({
          message: e.message,
          level: "error",
        });
        sendErrorToOwners(interaction, e, client);
        console.log(e);
        const errMessage = await interaction.followUp({
          embeds: [errorEmbedBuilder("An error occurred while running the command. " +
            "Please try the command again at a later time. The devs have been notified.")],
        });
        addAutoDeleteTimer(errMessage);
      } else {
        const error = e as APIEmbed;
        addAutoDeleteTimer(await interaction.followUp({ embeds: [error] }));
      }
    }
  },
};

export default event;

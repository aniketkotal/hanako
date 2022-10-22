import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../../index";
import { Event } from "../../typings/event";
import { ExtendedInteraction } from "../../typings/command";

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

    if (command.consumeInstantly) {
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as ExtendedInteraction,
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

    await interaction.deferReply({ ephemeral: command.ephemeral || false });
    await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
  },
};

export default event;

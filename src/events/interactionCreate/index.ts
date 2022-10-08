import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../../index";
import { Event } from "../../structures/Events";
import { ExtendedInteraction } from "../../typings/Command";

export default new Event("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.guildId)
    return interaction.reply(client.constants.error_messages.GUILD_ONLY);

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return interaction.reply("This command does not exists!");

  if (command.consumeInstantly) {
    return await command.run({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
    });
  }

  if (command.ownerOnly && !client.owners.includes(interaction.user.id)) {
    return interaction.reply({
      ephemeral: true,
      content: client.constants.error_messages.OWNER_ONLY,
    });
  }

  await interaction.deferReply({ ephemeral: command.ephemeral || false });
  await command.run({
    args: interaction.options as CommandInteractionOptionResolver,
    client,
    interaction: interaction as ExtendedInteraction,
  });
});

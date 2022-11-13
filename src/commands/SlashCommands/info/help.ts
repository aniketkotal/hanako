import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommandType } from "../../../typings/command";

const command: SlashCommandType = {
  name: "help",
  description: "See all commands provided by the bot",
  options: [
    {
      name: "command",
      description: "The command you need help with",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  run: async ({ interaction, client, guild }) => {
    const help = client.textCommands.get("help");
    const { options } = interaction;
    const cmd = options.get("command")?.value as string;
    if (!cmd) {
      const embed = await help.run({
        client,
        message: undefined,
        args: [],
        command: "",
        guild,
      });
      if (embed) await interaction.followUp({ embeds: [embed] });
    } else {
      const embed = await help.run({
        client,
        message: undefined,
        args: [cmd],
        command: "",
        guild,
      });

      if (embed) await interaction.followUp({ embeds: [embed] });
    }
  },
};

export default command;

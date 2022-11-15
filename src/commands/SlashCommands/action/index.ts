import { ApplicationCommandOptionType, ApplicationCommandSubCommandData } from "discord.js";
import { SlashCommandType } from "../../../typings/command";
import { DetailedActionNames, SimpleActionNames } from "../../../typings/client";

const detailedActions = Object.values(DetailedActionNames).flatMap(action => ({
  name: action,
  description: `Action command for ${action.slice(-1) === "e" ? action.slice(0, -1) : action}ing`,
  type: ApplicationCommandOptionType.Subcommand,
  options: [{
    name: "user",
    description: "The user to perform the action with",
    type: ApplicationCommandOptionType.User,
    required: true,
  }],
})) as ApplicationCommandSubCommandData[];

const simpleActions = Object.values(SimpleActionNames).flatMap(action => ({
  name: action,
  description: `Action command for ${action.slice(-1) === "e" ? action.slice(0, -1) : action}ing`,
  type: ApplicationCommandOptionType.Subcommand,
})) as ApplicationCommandSubCommandData[];

const command: SlashCommandType = {
  name: "action",
  description: "Perform an action",
  options: [...detailedActions, ...simpleActions],
  run: async (args) => {
    const { interaction, client } = args;
    const [{ name: cmd }] = interaction.options.data;
    const embed = await client.slashActionCommands.get(cmd).run(args);
    if (!embed) return;
    await interaction.followUp({ embeds: [embed] });
  },
};

export default command;

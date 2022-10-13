import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommand } from "../../../structures/Command";
import { prepareVotesEmbed } from "./helpers";

export default new SlashCommand({
  name: "check_movie_votes",
  description: "Get votes for a movie night",
  ownerOnly: true,
  ephemeral: true,
  options: [
    {
      name: "message_id",
      description: "Enter the message ID of the Movie Night",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async ({ client, interaction }) => {
    const messageID = interaction.options.get("message_id")?.value as string;

    const embed = await prepareVotesEmbed(messageID);
    if (typeof embed === "string") {
      await interaction.followUp({
        content: embed,
      });
    } else {
      await interaction.followUp({
        embeds: [embed],
      });
    }
  },
});

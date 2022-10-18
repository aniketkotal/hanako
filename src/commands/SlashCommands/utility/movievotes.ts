import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommand } from "../../../structures/Command";
import { prepareMovieNightDetailEmbed, prepareVotesEmbed } from "./helpers";
import { MovieNight } from "../../../db/models/MovieNights";

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
  run: async ({ interaction, client }) => {
    const messageID = interaction.options.get("message_id")?.value as string;

    const movieNight = await MovieNight.findOne({ where: { messageID } });
    const { error_messages } = client.constants;
    if (!movieNight) {
      return interaction.followUp({
        content: error_messages.MOVIE_NIGHT_NOT_FOUND,
      });
    }

    const votes = prepareVotesEmbed(movieNight);
    const details = prepareMovieNightDetailEmbed(movieNight);
    await interaction.followUp({
      embeds: [details, votes],
    });
  },
});

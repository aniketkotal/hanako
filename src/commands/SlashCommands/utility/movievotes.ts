import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommand } from "../../../structures/Command";
import { prepareMovieNightDetailEmbed, prepareVotesEmbed } from "./helpers";
import { MovieNights } from "../../../_db/schemas/MovieNights";

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
  run: async ({ interaction }) => {
    const messageID = interaction.options.get("message_id")?.value as string;

    const movieNight = await MovieNights.findOne({ messageID }).exec();

    const votes = await prepareVotesEmbed(movieNight);
    const details = prepareMovieNightDetailEmbed(movieNight);
    await interaction.followUp({
      embeds: [details, votes],
    });
  },
});

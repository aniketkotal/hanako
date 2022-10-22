import { ApplicationCommandOptionType } from "discord.js";
import { prepareMovieNightDetailEmbed, prepareVotesEmbed } from "./helpers";
import { MovieNights } from "../../../db/schemas/MovieNights";
import { SlashCommandType } from "../../../typings/command";

const command: SlashCommandType = {
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

    const movieNight = await MovieNights.findOne({ messageID }).exec();
    const { error_messages } = client.constants;
    if (!movieNight) {
      await interaction.followUp({
        content: error_messages.MOVIE_NIGHT_NOT_FOUND,
      });
      return;
    }

    const votes = await prepareVotesEmbed(movieNight);
    const details = prepareMovieNightDetailEmbed(movieNight);
    await interaction.followUp({
      embeds: [details, votes],
    });
  },
};

export default command;

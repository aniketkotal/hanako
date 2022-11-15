import { ApplicationCommandOptionType, Collection } from "discord.js";
import { SlashCommandType } from "../../../typings/command";
import create from "./modules/create";
import check from "./modules/check";
import announce from "./modules/announce";

const createMovieNightOption = {
  name: "create",
  description: "Create a Movie Night",
  type: 1,
  options: [
    {
      name: "first_movie",
      description: "Enter the name of the first movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "second_movie",
      description: "Enter the name of the second movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "third_movie",
      description: "Enter the name of final movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "time",
      description: "Enter the time to wait before announcing results in hours (Default: 24)",
      type: ApplicationCommandOptionType.Number,
    },
  ],
};
const checkMovieNightVotesOption = {
  name: "check_votes",
  description: "Check a Movie Night's votes",
  type: 1,
  options: [
    {
      name: "message_id",
      description: "Enter the message ID of the Movie Night",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
const announceMovieNightOption = {
  name: "announce",
  description: "Announce a Movie Night",
  type: 1,
  options: [
    {
      name: "movie_title",
      description: "Title of the Movie Night",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "movie_description",
      description: "Give a description of the Movie",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "trailer_url",
      description: "A link to the trailer of the movie",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "imdb_url",
      description: "A link to the IMDb page of the movie",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "hours_until_start",
      description: "How many hours until the movie night starts? Default: 7pm today",
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "additional_notes",
      description: "Additional notes for the Movie Night",
      type: ApplicationCommandOptionType.String,
    },
  ],
};

const modules = new Collection<string, SlashCommandType>();
modules.set(createMovieNightOption.name, create);
modules.set(checkMovieNightVotesOption.name, check);
modules.set(announceMovieNightOption.name, announce);

const command: SlashCommandType = {
  name: "movienight",
  description: "Movie Nights",
  options: [
    createMovieNightOption,
    checkMovieNightVotesOption,
    announceMovieNightOption,
  ],
  ephemeral: true,
  ownerOnly: true,
  run: async (args) => {
    const { interaction } = args;
    const [{ name: cmd }] = interaction.options.data;
    await modules.get(cmd).run(args);
    // if (!embed) return;
    // await interaction.followUp({ embeds: [embed] });
  },
};

export default command;

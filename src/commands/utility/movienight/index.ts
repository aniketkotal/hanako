import {
  APIButtonComponent,
  APIEmbed,
  ApplicationCommandOptionType,
} from "discord.js";
import moment from "moment";
import { Command } from "../../../structures/Command";
import { Logger } from "../../../structures/Logger";
import { MovieNightEmbed } from "../../../typings/ConstTypes";
import { localCollector } from "./collectors";

export default new Command({
  name: "movienight",
  description: "Create a movie night!",
  ephemeral: true,
  options: [
    {
      name: "movie1",
      description: "Enter the name of the first movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "movie2",
      description: "Enter the name of the second movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "movie3",
      description: "Enter the name of final movie title",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "time",
      description:
        "Enter the time to wait before announcing results in hours (Default: 24)",
      type: ApplicationCommandOptionType.Number,
    },
  ],
  run: async ({ client, interaction }) => {
    const { movienight } = client.additionalData.constants;

    const { options, guild, member } = interaction;

    try {
      if (!movienight.allowed_mnight_users_id.includes(member.id))
        throw new Error("You're not allowed to use this command!");

      const movies = [
        options.get("movie1"),
        options.get("movie2"),
        options.get("movie3"),
      ];
      const time: number = Number(options.get("time")?.value) || 24;

      const embedTexts = movienight.embed_texts;
      const embedConstant: MovieNightEmbed = await client.getRandomItem(
        embedTexts.all_variations,
      );

      const votesText = movies
        .map((movie, i) => `${movienight.vote_emotes[i]} ${movie.value}`)
        .join("\n");

      const timeVoteEnds: string = moment()
        .add({ hours: time })
        .unix()
        .toString();

      const movieEmbed: APIEmbed = {
        title: embedConstant.title,
        description: embedConstant.description,
        color: embedConstant.color,
        footer: {
          text: embedTexts.footer_until,
        },
        timestamp: moment().add({ hours: time }).toISOString(),
      };

      movieEmbed.description += votesText;

      const buttonTextToUse = await client.getRandomItem(
        movienight.button_text,
      );

      const buttons: APIButtonComponent[] = [
        {
          type: 2,
          style: 3,
          label: buttonTextToUse.labelSuccess,
          custom_id: "send",
        },
        {
          type: 2,
          style: 2,
          label: buttonTextToUse.labelCancel,
          custom_id: "cancel",
        },
      ];

      const actionRow = {
        type: 1,
        components: buttons,
      };

      const res = await interaction.followUp({
        content: movienight.messages.embed_preview_message,
        embeds: [movieEmbed],
        components: [actionRow],
      });

      const timeUntilEnd: number = time * 3600000;

      await localCollector(
        interaction,
        movienight,
        res,
        movies,
        movieEmbed,
        timeUntilEnd,
        client,
        timeVoteEnds,
      );
    } catch (e) {
      interaction.followUp({
        content: "An unknown error occurred! Please try again later.",
        ephemeral: true,
      });
      Logger.error(e);
      console.log(e);
    }
  },
});

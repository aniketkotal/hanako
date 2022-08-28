import { APIEmbed, ApplicationCommandOptionType } from "discord.js";
import moment from "moment";
import { Command } from "../../../structures/Command";
import { Logger } from "../../../structures/Logger";
import { MovieNightEmbed } from "../../../typings/ConstTypes";
import {
  addMovieNightCollector,
  addMovieNightToDB,
  sendMovieNightEmbed,
} from "./collectors";

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
    const { options, user, channel, guild } = interaction;

    if (!movienight.allowed_mnight_users_id.includes(user.id))
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
    const buttonText = await client.getRandomItem(movienight.button_text);

    const votesText = movies
      .map((movie, i) => `${movienight.vote_emotes[i]} ${movie.value}`)
      .join("\n");

    const timeVoteEnds: number = moment().add({ hours: time }).unix();

    const movieEmbed: APIEmbed = {
      title: embedConstant.title,
      description: embedConstant.description + votesText,
      color: embedConstant.color,
      footer: {
        text: embedTexts.footer_until,
        icon_url: guild.iconURL(),
      },
      timestamp: moment().add({ hours: time }).toISOString(),
    };

    const actionRow = {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: buttonText.labelSuccess,
          custom_id: "send",
        },
        {
          type: 2,
          style: 2,
          label: buttonText.labelCancel,
          custom_id: "cancel",
        },
      ],
    };

    try {
      const previewEmbedMessage = await interaction.followUp({
        content: movienight.messages.embed_preview_message,
        embeds: [movieEmbed],
        components: [actionRow],
        ephemeral: true,
      });

      const collector = previewEmbedMessage.createMessageComponentCollector({
        time: movienight.timeouts.preview_embed,
      });

      collector.on("collect", async i => {
        if (i.customId === "send") {
          const sentMessage = await sendMovieNightEmbed(
            interaction,
            movieEmbed,
            movies,
          );
          await addMovieNightToDB({
            movies: movies.map(movie => ({
              movieID: movie.name,
              name: String(movie.value),
            })),
            timeEnds: timeVoteEnds,
            createdBy: user.id,
            channelID: channel.id,
            messageID: sentMessage.id,
          });
          const timeUntilEnd: number = time * 3600000;
          await addMovieNightCollector(sentMessage, client, timeUntilEnd);
          await interaction.editReply({
            content: movienight.messages.on_success,
            components: [],
            embeds: [],
          });

          await interaction.editReply({
            content: movienight.messages.on_ok,
          });
          collector.stop("ok");
        } else {
          await interaction.editReply({
            content: movienight.messages.on_cancel,
            components: [],
            embeds: [],
          });
          collector.stop("cancel");
        }
      });

      collector.on("end", (_, reason) => {
        if (reason === "time") {
          interaction.followUp({
            content: movienight.messages.on_timeout,
            components: [],
            embeds: [],
          });
        }
      });
    } catch (e) {
      Logger.error(e);
      interaction.followUp({
        content: "An unknown error occurred! Please try again later.",
      });
    }
  },
});

import { APIEmbed, ApplicationCommandOptionType } from "discord.js";
import dayjs from "dayjs";
import { SlashCommand } from "../../../structures/Command";
import { Logger } from "../../../structures/Logger";
import {
  // addMovieNightCollector,
  addMovieNightToDB,
  sendMovieNightEmbed,
} from "./helpers";

export default new SlashCommand({
  name: "movie_night",
  description: "Create a movie night!",
  ownerOnly: true,
  ephemeral: true,
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
      description:
        "Enter the time to wait before announcing results in hours (Default: 24)",
      type: ApplicationCommandOptionType.Number,
    },
  ],
  run: async ({ client, interaction }) => {
    const { movie_night } = client.constants;
    const { options, user, channel } = interaction;
    const guild = interaction.guild;

    const movies = [
      options.get("first_movie"),
      options.get("second_movie"),
      options.get("third_movie"),
    ];

    const time: number = Number(options.get("time")?.value) || 24;

    const embedTexts = movie_night.embed_texts;
    const embedConstant =
      embedTexts.all_variations[
        Math.floor(Math.random() * embedTexts.all_variations.length)
      ];

    const buttonText =
      movie_night.button_text[
        Math.floor(Math.random() * movie_night.button_text.length)
      ];

    const votesText = movies
      .map(
        (movie, i) => `${movie_night.vote_emotes[i]} ${movie?.value as string}`
      )
      .join("\n");

    const timeVoteEnds: number = dayjs().add(time, "h").unix();

    const movieEmbed: APIEmbed = {
      title: embedConstant.title,
      description: embedConstant.description + votesText,
      color: embedConstant.color,
      footer: {
        text: embedTexts.footer_until,
        icon_url: guild?.iconURL(),
      },
      timestamp: dayjs().add(time, "h").toISOString(),
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
        content: movie_night.messages.embed_preview_message,
        embeds: [movieEmbed],
        components: [actionRow],
        ephemeral: true,
      });

      const collector = previewEmbedMessage.createMessageComponentCollector({
        time: movie_night.timeouts.preview_embed,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "send") {
          const sentMessage = await sendMovieNightEmbed(
            interaction,
            movieEmbed,
            movies
          );
          await addMovieNightToDB({
            movies: movies.map((movie) => ({
              movieID: movie.name,
              name: String(movie.value),
            })),
            timeEnds: timeVoteEnds,
            createdBy: user.id,
            channelID: channel.id,
            messageID: sentMessage.id,
          });
          // const timeUntilEnd: number = time * 3600000;
          // await addMovieNightCollector(sentMessage, client, timeUntilEnd);
          await interaction.editReply({
            content: movie_night.messages.on_ok,
            components: [],
            embeds: [],
          });

          await interaction.editReply({
            content: movie_night.messages.on_success,
          });
          collector.stop("ok");
        } else {
          await interaction.editReply({
            content: movie_night.messages.on_cancel,
            components: [],
            embeds: [],
          });
          collector.stop("cancel");
        }
      });

      collector.on("end", async (_, reason) => {
        if (reason === "time") {
          await interaction.followUp({
            content: movie_night.messages.on_timeout,
            components: [],
            embeds: [],
          });
        }
      });
    } catch (e) {
      Logger.error(e as Error);
      await interaction.followUp({
        content: "An unknown error occurred! Please try again later.",
      });
    }
  },
});

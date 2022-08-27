import {
  APIButtonComponent,
  APIEmbed,
  ApplicationCommandOptionType,
} from "discord.js";
import moment from "moment";
import { Command } from "../../../structures/Command";
import { Logger } from "../../../structures/Logger";
import { MovieNightEmbed } from "../../../typings/ConstTypes";
import { addCollector } from "./collectors";

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
        options.get("movie1", true),
        options.get("movie2", true),
        options.get("movie3", true),
      ];

      const time = options.get("time") || { value: 24 };

      const embedTexts = movienight.embed_texts;
      const embedConstant: MovieNightEmbed = await client.getRandomItem(
        embedTexts,
      );

      const movieEmbed: APIEmbed = {
        title: embedConstant.title,
        description: embedConstant.description,
        color: embedConstant.color,
        footer: {
          text: guild.name,
        },
        timestamp: new Date(Date.now()).toISOString(),
      };

      const votesText = movies
        .map(
          (movie, i) =>
            `${movienight.poll_emotes[i]} ${movie.value.toString()}`,
        )
        .join("\n");

      const timeVoteEnds: string = moment()
        .add({ hours: Number(time.value) })
        .unix()
        .toString();

      const endText: string = embedConstant.footer.replace("{}", timeVoteEnds);

      movieEmbed.description += votesText;
      movieEmbed.description += `\n\n${endText}`;

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
        content:
          "This is a preview of the embed that'll be sent. The reactions will be added on time of posting!",
        embeds: [movieEmbed],
        components: [actionRow],
      });

      const collector = res.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async i => {
        if (i.customId === "send") {
          interaction.editReply({
            content: "The voting message will be sent shortly!",
            components: [],
            embeds: [],
          });

          const finalBtns: APIButtonComponent[] = movies.map(i => ({
            type: 2,
            style: 1,
            label: String(i.value),
            custom_id: i.name,
          }));

          const finalRow = {
            type: 1,
            components: finalBtns,
          };

          const msg = await interaction.channel.send({
            embeds: [movieEmbed],
            components: [finalRow],
          });

          addCollector(msg.id, msg.channelId, client);

          await interaction.editReply({
            content: "The message was sent successfully!",
          });
        } else {
          interaction.editReply({
            content: "Welp. Start again I guess? dum bish",
            components: [],
            embeds: [],
          });
        }
      });
    } catch (e) {
      interaction.followUp({ content: e.message, ephemeral: true });
      Logger.error(e);
    }
  },
});

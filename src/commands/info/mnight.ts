import { APIEmbed, ApplicationCommandOptionType } from "discord.js";
import moment from "moment";
import { Command } from "../../structures/Command";
import { MovieNightEmbed } from "../../typings/ConstTypes";

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
    const { allowed_mnight_users_id, embed_texts, poll_emotes } =
      client.additionalData.constants;

    const { options, guild, member } = interaction;

    try {
      if (!allowed_mnight_users_id.includes(member.id))
        throw new Error("You're not allowed to use this command!");

      const movies = [
        options.get("movie1", true),
        options.get("movie2", true),
        options.get("movie3", true),
      ];

      const time = options.get("time") || { value: 24 };

      const embedTexts = embed_texts.movienight;
      const embedConstant: MovieNightEmbed =
        embedTexts[Math.floor(Math.random() * embedTexts.length)];

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
        .map((movie, i) => `${poll_emotes[i]} ${movie.value.toString()}`)
        .join("\n");

      const timeVoteEnds: string = moment()
        .add({ hours: Number(time.value) })
        .unix()
        .toString();

      const endText: string = embedConstant.footer.replace("{}", timeVoteEnds);

      movieEmbed.description += votesText;
      movieEmbed.description += `\n\n${endText}`;

      interaction.followUp({
        content:
          "This is a preview of the embed that'll be sent. The reactions will be added on time of posting!",
        embeds: [movieEmbed],
      });
    } catch (e) {
      interaction.followUp(e.message);
      console.log(e);
    }
  },
});

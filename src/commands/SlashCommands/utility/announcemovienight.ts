import {
  APIActionRowComponent,
  APIButtonComponent,
  APIEmbed,
  ApplicationCommandOptionType,
  GuildScheduledEventCreateOptions,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
import dayjs, { Dayjs } from "dayjs";
import { SlashCommandType } from "../../../typings/command";

const command: SlashCommandType = {
  name: "announce_movie_night",
  description: "Announce a movie night!",
  ownerOnly: true,
  ephemeral: true,
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
  run: async ({ interaction, client }) => {
    const { options } = interaction;

    await interaction.followUp({
      content: "Send the cover to use for the movie embed",
    });

    const msg = (
      await interaction.channel.awaitMessages({
        time: 60000,
        max: 1,
      })
    ).first();

    const { embed_texts } = client.constants.announce_movie_night;
    const [
      movie_title,
      movie_description,
      trailer_url,
      imdb_url,
      hours_until_start,
      additional_notes,
    ] = [
      options.get("movie_title"),
      options.get("movie_description"),
      options.get("trailer_url"),
      options.get("imdb_url"),
      options.get("hours_until_start"),
      options.get("additional_notes"),
    ];

    movie_title.value = client.helpers.toTitleCase(String(movie_title.value));

    const url = msg.attachments.first()?.url || msg.content;
    let time: Dayjs;
    if (!hours_until_start) time = dayjs().hour(9).minute(30);
    else time = dayjs().add(+hours_until_start.value, "hours");

    const embed: APIEmbed = {
      title: embed_texts.title.replace("{title}", String(movie_title.value)),
      description: embed_texts.description
        .replace("{title}", String(movie_title.value))
        .replace("{description}", String(movie_description.value))
        .replace("{trailer}", String(trailer_url.value))
        .replace("{imdb}", String(imdb_url.value))
        .replace("{unix}", String(time.unix()))
        .replace("{notes}", String(additional_notes?.value || "None")),
      color: embed_texts.color,
      image: {
        url,
      },
    };
    const row: APIActionRowComponent<APIButtonComponent> = {
      type: 1,
      components: [
        { style: 3, label: "Send", custom_id: "send", type: 2 },
        { style: 4, label: "Cancel", custom_id: "cancel", type: 2 },
      ],
    };

    const {
      MOVIE_GUILD_ID,
      MOVIE_ANNOUNCE_CHANNEL_ID,
      MOVIE_ANNOUNCE_ROLE_ID,
    } = process.env;

    const previewEmbedMessage = await interaction.followUp({
      embeds: [embed],
      content:
        "This is a preview of the content that will be sent. " +
        "Check if you want any changes. After confirming, " +
        `A message will be sent to <#${MOVIE_ANNOUNCE_CHANNEL_ID}> and a movie night will be scheduled.`,
      components: [row],
    });

    const response = await previewEmbedMessage.awaitMessageComponent({
      time: 60000,
    });
    if (response.customId === "send") {
      const guild = client.guilds.cache.get(MOVIE_GUILD_ID);

      const guildEventDescription =
        "Our weekly movie night is being held today! Join us to watch the movie together! " +
        "Click the Interested button to be reminded of the event!";

      const guildEvent: GuildScheduledEventCreateOptions = {
        name: `${String(movie_title.value)} - Movie Night`,
        description: guildEventDescription,
        scheduledStartTime: time.toISOString(),
        scheduledEndTime: time.add(2, "hours").toISOString(),
        entityType: GuildScheduledEventEntityType.Voice,
        channel: "869065051217227786",
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      };
      const event = await guild.scheduledEvents.create(guildEvent);
      embed.url = event.url;

      const channel = await guild.channels.fetch(MOVIE_ANNOUNCE_CHANNEL_ID);
      if (channel.isTextBased()) {
        const movieNightAnnouncementMessage = await channel.send({
          content: `<@${MOVIE_ANNOUNCE_ROLE_ID}>`,
          embeds: [embed],
        });
        await movieNightAnnouncementMessage.react("🎉");
        await movieNightAnnouncementMessage.channel.send(event.url);
        await interaction.editReply({
          content: "Movie Night has been announced! 🎉",
        });
      }
    } else if (response.customId === "cancel") {
      await interaction.followUp({
        content: `Cancelled!`,
        ephemeral: true,
      });
    }
  },
};

export default command;

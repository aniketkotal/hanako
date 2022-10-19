import {
  APIEmbed,
  CommandInteraction,
  CommandInteractionOption,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageReaction,
  User,
} from "discord.js";
import dayjs from "dayjs";
import {
  MovieNight,
  MovieNightDocument,
  MovieNights,
} from "../../../db/schemas/MovieNights";
import { MovieVotes } from "../../../db/schemas/MovieVotes";
import { ExtendedClient } from "../../../structures/Client";
import { Logger } from "../../../structures/Logger";
import constants from "../../../constants/constants.json";
import { Constant } from "../../../typings/client";
import { client } from "../../../index";

const { movie_night, movie_votes, error_messages } = constants as Constant;

const updateCollectorTimings = async (): Promise<void> => {
  const currentTime = dayjs().unix();

  const aliveNights = await MovieNights.getAliveMovieNights(currentTime);
  if (!aliveNights.length) return;

  const movieNights = aliveNights.map(async (night) => {
    const remainingTime = dayjs.unix(night.timeEnds).diff(dayjs(), "ms");
    return addMovieNightCollector(
      night.messageID,
      client,
      remainingTime,
      night.channelID
    );
  });

  try {
    await Promise.all(movieNights);
  } catch (e) {
    Logger.error(e as Error);
  }
};

const addMovieNightCollector = async (
  messageData: string | Message,
  client: ExtendedClient,
  time: number,
  channelID?: string
): Promise<void> => {
  let message: Message;
  if (typeof messageData === "string" && channelID) {
    const res = await client.helpers.getMessage(messageData, channelID);
    if (!res) return;
    else message = res;
  } else {
    message = messageData as Message;
  }

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time,
  });

  const reactionFilter = (reaction: MessageReaction, user: User) =>
    !!(reaction.emoji.name === "❌" && client.owners.includes(user.id));
  const stopCollectorFromReaction = message.createReactionCollector({
    time,
    filter: reactionFilter,
  });
  stopCollectorFromReaction.on("collect", async () => {
    await message.reactions.removeAll();
    collector.stop("end");
  });

  collector.on("collect", async (i) => {
    await i.deferReply({ ephemeral: true });

    const vote = await MovieVotes.addMovieVote({
      messageID: message.id,
      user: {
        userID: i.user.id,
        username: i.user.username,
        hash: i.user.discriminator,
      },
      movieID: i.customId,
    });

    if (vote === null) {
      await i.followUp({
        content: movie_votes.messages.on_vote_add,
      });
    } else {
      await i.followUp({
        content: movie_votes.messages.on_vote_update,
      });
    }
  });

  collector.on("end", async () => {
    const movieData = await MovieNights.findOne({ messageID: message.id });

    //Edit old movie night message
    const row = {
      type: 1,
      components: movieData?.movies.map((i) => ({
        type: 2,
        style: 1,
        label: i.name,
        custom_id: i.movieID,
        disabled: true,
      })),
    };
    const embed = new EmbedBuilder(message.embeds[0].data).setFooter({
      text: movie_night.embed_texts.footer_since,
    });
    await message.edit({
      content: movie_night.messages.message_on_finish,
      components: [row],
      embeds: [embed],
    });

    // Send message to owners
    const movieNight = await MovieNights.findOne({
      messageID: message.id,
    }).exec();
    if (!movieNight) {
      return await sendMessageToOwners(
        [{ description: error_messages.MOVIE_NIGHT_NOT_FOUND }],
        client
      );
    }

    const embeds = [
      prepareMovieNightDetailEmbed(movieNight),
      await prepareVotesEmbed(movieNight),
    ];

    await sendMessageToOwners(embeds, client);
  });
};

const sendMessageToOwners = async (
  embed: Array<APIEmbed>,
  client: ExtendedClient
) => {
  try {
    const owners = process.env.OWNER_IDS.split(",").map((owner) =>
      client.users.fetch(owner)
    );
    const ownersFetched = await Promise.all(owners);
    await Promise.all(
      ownersFetched.map((owner) =>
        owner.send({
          content: movie_night.messages.owner_message_on_finish,
          embeds: embed,
        })
      )
    );
  } catch (e) {
    Logger.error(e as Error);
  }
};

export const prepareMovieNightDetailEmbed = (
  movieNight: MovieNightDocument
) => {
  const { title, description } = movie_night.embed_texts.owner_message_texts;
  const { channelID, createdBy, timeEnds } = movieNight;

  const dateFormat = "MMM D, YYYY hh:mma";

  const endsOn = dayjs.unix(timeEnds).format(dateFormat);

  const embed: APIEmbed = {
    title,
    description,
    url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
    color: parseInt("a29bfe", 16),
    fields: [
      {
        inline: true,
        name: "Created By",
        value: `<@${createdBy}>`,
      },
      {
        inline: true,
        name: "Channel Hosted",
        value: `<#${channelID}>`,
      },
      {
        inline: true,
        name: "Expiry Timestamp",
        value: endsOn,
      },
    ],
  };

  return embed;
};

const prepareVotesEmbed = async (
  movieNight: MovieNightDocument
): Promise<APIEmbed> => {
  const { movies } = movieNight;
  const movieVotes = await movieNight.getAllVotes();

  const movieDataFields = movies.map(({ movieID }) => {
    const votes = movieVotes[movieID] || [];

    const voters =
      votes.map(({ user }) => `${user.username}#${user.hash}`).join(", ") ||
      error_messages.NO_VOTES;
    const movieName = movies.find((i) => i.movieID === movieID)?.name;

    return {
      inline: false,
      name: movie_votes.embed_texts.fields.title
        .replace("{movie_title}", movieName)
        .replace("{vote_count}", String(votes.length)),
      value: voters,
    };
  });

  const { embed_texts } = movie_votes;

  return {
    title: embed_texts.title,
    fields: movieDataFields,
    color: parseInt("ff7675", 16),
  };
};

const sendMovieNightEmbed = async (
  interaction: CommandInteraction,
  embedData: APIEmbed,
  movies: readonly CommandInteractionOption[]
): Promise<Message> =>
  interaction.channel.send({
    embeds: [embedData],
    components: [
      {
        type: 1,
        components: movies.map((i) => ({
          type: 2,
          style: 1,
          label: String(i.value),
          custom_id: i.name,
        })),
      },
    ],
  });

const addMovieNightToDB = async (movieNight: MovieNight) => {
  try {
    const mnight = new MovieNights(movieNight);
    return mnight.save();
  } catch (e) {
    Logger.error(e as Error);
  }
};

export {
    addMovieNightCollector,
    updateCollectorTimings,
    sendMovieNightEmbed,
    addMovieNightToDB,
    prepareVotesEmbed,
};

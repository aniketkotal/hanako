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
import { Movie, MovieNight } from "../../../db/models/MovieNights";
import { ExtendedClient } from "../../../structures/Client";
import { Logger } from "../../../structures/Logger";
import constants from "../../../constants/constants.json";
import { Constant } from "../../../typings/client";
import { Op, Optional } from "sequelize";
import { MovieVote } from "../../../db/models/MovieVotes";
import { client } from "../../../index";
import { NullishPropertiesOf } from "sequelize/types/utils";

const { movie_night, movie_votes, error_messages } = constants as Constant;

const updateCollectorTimings = async (): Promise<void> => {
  const currentTime = dayjs().unix();

  const aliveNights = await MovieNight.findAll({
    where: {
      timeEnds: {
        [Op.gte]: currentTime,
      },
    },
  });

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
    const res = await client.getMessage(messageData, channelID);
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

    const vote = await MovieVote.create({
      messageID: message.id,
      userID: i.user.id,
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
    const { movies: moviesJSON } = await MovieNight.findOne({
      include: [MovieVote],
      where: {
        messageID: message.id,
      },
    });
    const movies = JSON.parse(moviesJSON) as Array<Movie>;

    //Edit old movie night message
    const row = {
      type: 1,
      components: movies.map((i) => ({
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

    const movieNight = await MovieNight.findOne({
      where: { messageID: message.id },
    });
    if (!movieNight) {
      return await sendMessageToOwners(
        [{ description: error_messages.MOVIE_NIGHT_NOT_FOUND }],
        client
      );
    }

    const embeds = [
      prepareMovieNightDetailEmbed(movieNight),
      prepareVotesEmbed(movieNight),
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

export const prepareMovieNightDetailEmbed = (movieNight: MovieNight) => {
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

const getAllVotes = (votes: Array<MovieVote>) => {
  const movies: { [key: string]: Array<MovieVote> } = {};
  votes.forEach((vote) => {
    if (!movies[vote.movieID]) movies[vote.movieID] = [];
    movies[vote.movieID].push(vote);
  });
  return movies;
};

const prepareVotesEmbed = (movieNight: MovieNight): APIEmbed => {
  const { movies: moviesJSON, votes } = movieNight;
  const movies = JSON.parse(moviesJSON) as Array<Movie>;
  const movieVotes = getAllVotes(votes);

  const movieDataFields = movies.map(({ movieID }) => {
    const votes = movieVotes[movieID] || [];
    const users = votes.map((vote) => `<@${vote.userID}>`);

    const voters = users.join(", ") || error_messages.NO_VOTES;
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

const addMovieNightToDB = async (
  movieNight: Optional<MovieNight, NullishPropertiesOf<MovieNight>>
) => {
  try {
    return MovieNight.create(movieNight);
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

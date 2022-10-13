import {
  APIEmbed,
  CommandInteraction,
  CommandInteractionOption,
  ComponentType,
  EmbedBuilder,
  Message,
} from "discord.js";
import dayjs from "dayjs";
import { MovieNight, MovieNights } from "../../../db/schemas/MovieNights";
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
  if (typeof messageData === "string") {
    message = await client.getMessage(messageData, channelID);
    if (!message) return;
  } else {
    message = messageData;
  }

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time,
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
      components: movieData.movies.map((i) => ({
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
    await sendMessageToOwners([await prepareVotesEmbed(message.id)], client);
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

const prepareVotesEmbed = async (messageID: string): Promise<APIEmbed> => {
  const movieNight = await MovieNights.findOne({ messageID }).exec();
  if (!movieNight) return { description: error_messages.MOVIE_NIGHT_NOT_FOUND };

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

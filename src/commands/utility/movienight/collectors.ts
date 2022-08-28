import {
  APIButtonComponent,
  APIEmbed,
  CommandInteraction,
  CommandInteractionOption,
  ComponentType,
  Message,
} from "discord.js";
import moment from "moment";
import { client } from "../../..";
import { MovieNight, MovieNights } from "../../../db/schemas/MovieNights";
import { MovieVote, MovieVotes } from "../../../db/schemas/MovieVotes";
import { ExtendedClient } from "../../../structures/Client";
import { Logger } from "../../../structures/Logger";
import { ExtendedInteraction } from "../../../typings/Command";

const updateCollectorTimings = async () => {
  const aliveNights = await MovieNights.find({
    timeEnds: { $gte: moment().unix() },
  });
  if (!aliveNights.length) return;
  aliveNights.forEach(i =>
    addMovieNightCollector(i.messageID, i.channelID, client, +i.timeEnds),
  );
};

const addMovieNightCollector = async (
  messageData: string | Message,
  channelID: string,
  client: ExtendedClient,
  time: number,
) => {
  try {
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

    const [movieData] = await MovieNights.find({ messageData });

    collector.on("collect", async i => {
      await i.deferReply({ ephemeral: true });

      const vote = await addMovieVote({
        messageID: message.id,
        userID: i.user.id,
        movieID: i.customId,
      } as MovieVote);

      if (vote === null) {
        await i.followUp({
          content: `Your vote was added!`,
        });
      } else {
        await i.followUp({
          content: "Your vote was updated!",
        });
      }
    });

    collector.on("end", async i => {
      const btns: APIButtonComponent[] = [];
      movieData.movies.forEach(i => {
        btns.push({
          type: 2,
          style: 1,
          label: i.name,
          custom_id: i.movieID,
          disabled: true,
        });
      });
      const row = {
        type: 1,
        components: btns,
      };
      console.log(i);
      message.edit({ components: [row] });
    });
  } catch (e) {
    Logger.error(e.message);
  }
};

const sendMovieNightEmbed = async (
  interaction: CommandInteraction,
  embedData: APIEmbed,
  movies: readonly CommandInteractionOption[],
): Promise<Message> =>
  await interaction.channel.send({
    embeds: [embedData],
    components: [
      {
        type: 1,
        components: movies.map(i => ({
          type: 2,
          style: 1,
          label: String(i.value),
          custom_id: i.name,
        })),
      },
    ],
  });

const previewEmbedCollector = async (
  interaction: ExtendedInteraction,
  constants: any,
  message: Message,
  movies: readonly CommandInteractionOption[],
  embedData: APIEmbed,
  remainTime: number,
  client: ExtendedClient,
  endTime: number,
) => {
  const collector = message.createMessageComponentCollector({
    time: 60000,
  });

  collector.on("collect", async i => {
    if (i.customId === "send") {
      interaction.editReply({
        content: constants.messages.on_ok,
        components: [],
        embeds: [],
      });

      const msg = await sendMovieNightEmbed(interaction, embedData, movies);

      await addMovieNightToDB({
        movies: movies.map(movie => ({
          movieID: movie.name,
          name: String(movie.value),
        })),
        timeEnds: endTime,
        createdBy: interaction.member.user.id,
        channelID: interaction.channelId,
        messageID: msg.id,
      } as MovieNight);

      await addMovieNightCollector(msg.id, msg.channelId, client, remainTime);

      await interaction.editReply({
        content: constants.messages.on_success,
      });

      collector.stop("finish");
    } else {
      interaction.editReply({
        content: constants.messages.on_cancel,
        components: [],
        embeds: [],
      });
    }
  });

  collector.on("end", (_, reason) => {
    if (reason === "time") {
      interaction.followUp({
        content: constants.messages.on_timeout,
        components: [],
        embeds: [],
      });
    }
  });
};

async function addMovieVote(movieVote: MovieVote) {
  const res = await MovieVotes.findOneAndUpdate(
    { userID: movieVote.userID, messageID: movieVote.messageID },
    movieVote,
    {
      upsert: true,
    },
  );
  return res;
}

async function addMovieNightToDB(movieNight: MovieNight) {
  try {
    const mnight = new MovieNights(movieNight);
    const result = await mnight.save();
    return result;
  } catch (e) {
    console.log(e);
  }
}

export {
  addMovieNightCollector,
  previewEmbedCollector,
  updateCollectorTimings,
};

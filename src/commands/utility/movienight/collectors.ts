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

const updateCollectorTimings = async () => {
  const currentTime = moment();
  const aliveNights = await MovieNights.find({
    timeEnds: { $gte: currentTime.unix() },
  });
  if (!aliveNights.length) return;
  aliveNights.forEach(movieNight => {
    const remainingTime = moment
      .unix(movieNight.timeEnds)
      .diff(currentTime, "milliseconds");

    addMovieNightCollector(
      movieNight.messageID,
      client,
      remainingTime,
      movieNight.channelID,
    );
  });
};

const addMovieNightCollector = async (
  messageData: string | Message,
  client: ExtendedClient,
  time: number,
  channelID?: string,
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
    const [movieData] = await MovieNights.find({ messageID: message.id });

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

    collector.on("end", async () => {
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
  updateCollectorTimings,
  sendMovieNightEmbed,
  addMovieNightToDB,
};

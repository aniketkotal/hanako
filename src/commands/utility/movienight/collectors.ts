import {
  APIEmbed,
  BaseGuildTextChannel,
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

export const updateCollectorTimings = () => {
  const currentData = moment().unix();
  MovieNights.find({ timeEnds: { $lte: currentData } }, (err, res) => {
    if (err) {
      console.log(err);
      throw new Error("An error occurred");
    }
    if (res.length === 0) return;
    res.forEach(i => {
      addGlobalCollector(i.messageID, i.channelID, client, +i.timeEnds);
    });
  });
};

const addGlobalCollector = async (
  messageID: string,
  channelID: string,
  client: ExtendedClient,
  time: number,
) => {
  try {
    const channel = (await client.channels.fetch(
      channelID,
    )) as BaseGuildTextChannel;

    if (!channel)
      throw new Error(
        `The channel(${channelID}) was not found! The collector is not added.`,
      );

    const messages = await channel.messages.fetch({ limit: 5 });
    const message = messages.get(messageID);

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time,
    });

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
      message.edit({ components: [] });
    });
  } catch (e) {
    Logger.error(e.message);
  }
};

const localCollector = async (
  interaction: ExtendedInteraction,
  constants: any,
  message: Message,
  movies: readonly CommandInteractionOption[],
  embedData: APIEmbed,
  remainTime: number,
  client: ExtendedClient,
  endTime: string,
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

      const msg = await interaction.channel.send({
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

      await createMovieNight({
        movies: movies.map(movie => ({
          movieID: movie.name,
          name: String(movie.value),
        })),
        timeEnds: endTime,
        createdBy: interaction.member.user.id,
        channelID: interaction.channelId,
        messageID: msg.id,
      } as MovieNight);

      await addGlobalCollector(msg.id, msg.channelId, client, remainTime);

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

async function createMovieNight(movieNight: MovieNight) {
  try {
    const mnight = new MovieNights(movieNight);

    const result = await mnight.save();

    return result;
  } catch (e) {
    console.log(e);
  }
}

export { addGlobalCollector, localCollector };

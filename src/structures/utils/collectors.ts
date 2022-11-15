import dayjs from "dayjs";
import type { ExtendedClient } from "../Client";
import { MovieNights } from "../../db/schemas/MovieNights";
import logger from "../Logger";
import { addMovieNightCollector } from "../../commands/SlashCommands/movie_night/helpers";

export const updateAliveMovieNightsCollector = async (client: ExtendedClient): Promise<void> => {
  const currentTime = dayjs().unix();

  const aliveNights = await MovieNights.getAliveMovieNights(currentTime);
  if (!aliveNights.length) return;

  const movieNights = aliveNights.map(async (night) => {
    const remainingTime = dayjs.unix(night.timeEnds).diff(dayjs(), "ms");
    return addMovieNightCollector(night.messageID, client, remainingTime, night.channelID);
  });

  try {
    await Promise.all(movieNights);
  } catch (e) {
    const error = e as Error;
    logger.log({
      message: error.message,
      level: "error",
    });
  }
};

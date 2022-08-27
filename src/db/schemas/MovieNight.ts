import { Schema } from "mongoose";

type Movie = {
  name: string;
  voteCount: number;
};

interface MovieNight {
  movies: Movie[];
  timeEnds: string;
  createdBy: string;
  channelToSend: string;
}

const MovieNight = new Schema<MovieNight>({
  movies: {
    type: Schema.Types.Mixed,
  },
  timeEnds: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  channelToSend: {
    type: String,
    required: true,
  },
});

export default MovieNight;

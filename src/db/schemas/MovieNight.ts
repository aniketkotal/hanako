import { Schema } from "mongoose";

type Movie = {
  name: String;
  voteCount: number;
};

interface MovieNight {
  movies: Movie[];
  timeEnds: String;
  createdBy: String;
  channelToSend: String;
  messageID: String;
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
  messageID: {
    type: String,
    required: true,
  },
});

export default MovieNight;

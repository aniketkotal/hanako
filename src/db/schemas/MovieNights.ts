import { Document, model, Schema } from "mongoose";
import { MovieVote } from "./MovieVotes";

export type Movie = {
  movieID: string;
  name: string;
};

export interface MovieNight {
  messageID: string;
  movies: Array<Movie>;
  timeEnds: number;
  createdBy: string;
  channelID: string;
}

interface MovieNightDocument extends MovieNight, Document {
  votes: Array<MovieVote>;
  getAllVotes: () => Promise<Array<Array<MovieVote>>>;
}

const movieNightsSchema: Schema<MovieNightDocument> = new Schema(
  {
    messageID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    movies: {
      type: Schema.Types.Mixed,
      required: true,
    },
    timeEnds: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    channelID: {
      type: String,
      required: true,
    },
  },
  {
    methods: {
      async getAllVotes() {
        const { votes } = await this.populate("votes");
        const movies: { [key: string]: Array<MovieVote> } = {};
        votes.forEach((vote) => {
          if (!movies[vote.movieID]) movies[vote.movieID] = [];
          movies[vote.movieID].push(vote);
        });

        return Object.values(movies);
      },
    },
    virtuals: {
      votes: {
        options: {
          ref: "MovieVotes",
          localField: "messageID",
          foreignField: "messageID",
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const MovieNights = model<MovieNightDocument>(
  "MovieNights",
  movieNightsSchema,
  "MovieNights"
);


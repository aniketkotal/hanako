import { Document, model, Schema, Model } from "mongoose";
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

export interface MovieNightDocument extends MovieNight, Document {
  votes: Array<MovieVote>;
  getAllVotes: () => Promise<{ [key: string]: Array<MovieVote> }>;
}

interface MovieNightModel extends Model<MovieNightDocument> {
  getAliveMovieNights: (timeUntil: number) => Promise<Array<MovieNight>>;
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

        return movies;
      },
    },
    statics: {
      async getAliveMovieNights(timeUntil: number) {
        return this.find({ timeEnds: { $gt: timeUntil } });
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
    timestamps: true,
  },
);

export const MovieNights = model<MovieNightDocument, MovieNightModel>(
  "MovieNights",
  movieNightsSchema,
  "MovieNights",
);

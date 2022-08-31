import { model, Schema, Document } from "mongoose";

export interface MovieVote extends Document {
  user: {
    userID: string;
    username: string;
    hash: string;
  };
  movieID: string;
  messageID: string;
}

const movieVoteSchema: Schema = new Schema({
  user: {
    userID: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    hash: {
      type: String,
    },
  },
  messageID: {
    type: String,
    required: true,
    ref: "MovieNight",
  },
  movieID: {
    type: String,
    required: true,
  },
});

export const MovieVotes = model<MovieVote>("MovieVotes", movieVoteSchema);

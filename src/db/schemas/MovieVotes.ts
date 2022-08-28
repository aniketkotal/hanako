import { model, Schema, Document } from "mongoose";

export interface MovieVote extends Document {
  userID: string;
  movieID: string;
  messageID: string;
}

const movieVoteSchema: Schema = new Schema({
  userID: {
    type: String,
    required: true,
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

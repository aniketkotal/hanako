import { model, Schema, Document } from "mongoose";

export type Movie = {
  movieID: string;
  name: string;
};

export interface MovieNight extends Document {
  movies: Movie[];
  timeEnds: string;
  createdBy: string;
  channelID: string;
  messageID: string;
}

const movieNightsSchema: Schema = new Schema({
  movies: {
    type: Schema.Types.Mixed,
    required: true,
  },
  timeEnds: {
    type: String,
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
  messageID: {
    type: String,
    required: true,
  },
});

export const MovieNights = model<MovieNight>("MovieNights", movieNightsSchema);
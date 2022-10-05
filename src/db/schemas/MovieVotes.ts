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

const movieVoteSchema: Schema = new Schema(
  {
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
    },
    movieID: {
      type: String,
      required: true,
    },
  },
  {
    statics: {
      async addMovieVote(movieVote: MovieVote): Promise<MovieVote> {
        const { user, messageID } = movieVote;
        return this.findOneAndUpdate(
          {
            user: {
              userID: user.userID,
              username: user.username,
              hash: user.hash,
            },
            messageID: messageID,
          },
          movieVote,
          { upsert: true }
        );
      },
    },
  }
);

export const MovieVotes = model<MovieVote>(
  "MovieVotes",
  movieVoteSchema,
  "MovieVotes"
);

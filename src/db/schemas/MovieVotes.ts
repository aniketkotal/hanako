import { model, Schema, Document, Model } from "mongoose";

export interface MovieVote {
  user: {
    userID: string;
    username: string;
    hash: string;
  };
  movieID: string;
  messageID: string;
}

type MovieVoteDocument = Document & MovieVote;

interface MovieVoteModel extends Model<MovieVoteDocument> {
  addMovieVote: (movieVote: MovieVote) => Promise<MovieVote>;
}

const movieVoteSchema: Schema<MovieVoteDocument> = new Schema(
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
    timestamps: true,
  }
);

export const MovieVotes = model<MovieVoteDocument, MovieVoteModel>(
  "MovieVotes",
  movieVoteSchema,
  "MovieVotes"
);

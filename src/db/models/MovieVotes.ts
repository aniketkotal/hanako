import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../index";

export interface MovieVote
  extends Model<
    InferAttributes<MovieVote>,
    InferCreationAttributes<MovieVote>
  > {
  user: {
    userID: string;
    username: string;
    hash: string;
  };
  movieID: string;
  messageID: string;
}

export const MovieNights = sequelize.define<MovieVote>(
  "MovieVotes",
  {
    user: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    movieID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messageID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

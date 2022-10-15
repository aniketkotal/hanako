import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../index";

export type Movie = {
  movieID: string;
  name: string;
};

export interface MovieNight
  extends Model<
    InferAttributes<MovieNight>,
    InferCreationAttributes<MovieNight>
  > {
  messageID: string;
  movies: Array<Movie>;
  timeEnds: number;
  createdBy: string;
  channelID: string;
}

export const MovieNights = sequelize.define<MovieNight>(
  "MovieNights",
  {
    messageID: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    movies: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
    },
    timeEnds: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channelID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

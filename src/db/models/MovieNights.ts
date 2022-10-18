import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Op,
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
  // votes: Array<MovieVote>;
}

export const MovieNights = sequelize.define<MovieNight>(
  "MovieNights",
  {
    messageID: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
    },
    movies: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
    },
    timeEnds: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    // votes: {
    //   type: DataTypes.ARRAY(DataTypes.JSON),
    //   references: {
    //     key: "messageID",
    //     model: "MovieVotes",
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

// MovieNights.prototype.getAliveMovieNights = async function (timeUntil: number) {
//   return await this.findAll({
//     where: {
//       timeEnds: {
//         [Op.gt]: timeUntil,
//       },
//     },
//   });
// };

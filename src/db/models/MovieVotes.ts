import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { MovieNight } from "./MovieNights";

@Table
export class MovieVote extends Model<MovieVote> {
  @Column({
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  userID: string;

  @Column
  movieID: string;

  @ForeignKey(() => MovieNight)
  @Column
  messageID: string;

  @BelongsTo(() => MovieNight)
  movieNight: MovieNight;
}

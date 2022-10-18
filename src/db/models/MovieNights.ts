import { MovieVote } from "./MovieVotes";

export type Movie = {
  movieID: string;
  name: string;
};

import { Column, HasMany, Model, Table } from "sequelize-typescript";

@Table
export class MovieNight extends Model<MovieNight> {
  @Column({
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  messageID: string;

  @Column
  movies: string;

  @Column
  timeEnds: number;

  @Column
  createdBy: string;

  @Column
  channelID: string;

  @HasMany(() => MovieVote)
  votes: Array<MovieVote>;
}

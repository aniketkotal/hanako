import { Sequelize } from "sequelize-typescript";
import { ActionCount } from "./models/ActionCounts";
import { MovieNight } from "./models/MovieNights";
import { MovieVote } from "./models/MovieVotes";
import { User } from "./models/User";

const { DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = process.env;
// export const sequelize = new Sequelize(
//   `postgres://${DB_USER}:${DB_PASSWORD}@:${DB_PORT}/${DB_NAME}`
// );

export const sequelize = new Sequelize({
  username: DB_USER,
  host: "localhost",
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  dialect: "postgres",
  models: [ActionCount, MovieNight, MovieVote, User],
});

import { Sequelize } from "sequelize";

const { DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } = process.env;
export const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@:${DB_PORT}/${DB_NAME}`
);

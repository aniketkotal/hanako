import mongoose from "mongoose";
import logger from "../Logger";

export default async () => {
  try {
    const { DB_URL } = process.env;
    mongoose.connect(DB_URL).catch(logger.error);
    const db = mongoose.connection;
    db.on("connecting", () => {
      logger.log({
        message: "Connecting to DB...",
        level: "info",
      });
    });
    db.once("connected", () => {
      logger.log({
        message: "Connected to DB!",
        level: "info",
      });
    });

    db.on("error", () => {
      throw new Error("Failed connecting to DB!");
    });
  } catch (e) {
    const error = e as Error;
    logger.log({
      message: error.message,
      level: "error",
    });
  }
};

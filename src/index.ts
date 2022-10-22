import dotenv from "dotenv";
import { ExtendedClient } from "./structures/Client";
import logger from "./structures/Logger";

dotenv.config();

export const client = new ExtendedClient();

client.start().catch((e) => {
  const error = e as Error;
  logger.log({
    message: error.message,
    level: "error",
  });
});

process.on("uncaughtException", (e) => {
  // const error = e as Error;
  // logger.log({
  //   message: error.message,
  //   level: "error",
  // });
});

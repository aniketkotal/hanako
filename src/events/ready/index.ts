import { Event } from "../../typings/event";
import logger from "../../structures/Logger";

export const event: Event<"ready"> = {
  event: "ready",
  run: async () => {
    logger.log({
      message: "The bot is connected and ready!",
      level: "http",
    });
  },
};

export default event;

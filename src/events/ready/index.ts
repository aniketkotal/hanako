import { Event } from "../../typings/event";
import { Logger } from "../../structures/Logger";

export const event: Event<"ready"> = {
  event: "ready",
  run: async () => {
    Logger.info("The bot is connected and ready!");
  },
};

export default event;

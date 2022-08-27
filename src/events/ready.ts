import { Event } from "../structures/Events";
import { Logger } from "../structures/Logger";

export default new Event("ready", () => {
  Logger.info("The bot is connected and ready!");
});

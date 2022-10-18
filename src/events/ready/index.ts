import { Event } from "../../structures/Events";
import { Logger } from "../../structures/Logger";
import { User } from "../../db/models/User";
import { MovieNights } from "../../db/models/MovieNights";

export default new Event("ready", async () => {
  Logger.info("The bot is connected and ready!");
});

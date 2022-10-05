import { TextCommand } from "../../../structures/Command";
import { MovieNights } from "../../../db/schemas/MovieNights";

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
  run: async ({ client, message }) => {},
});

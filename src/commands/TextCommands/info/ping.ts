import { TextCommand } from "../../../structures/Command";
import { MovieNights } from "../../../db/schemas/MovieNights";

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
  run: async ({ client, message }) => {
    // const mn = await MovieNights.findOne({}).populate("votes");
    // console.log(mn);
    const mv = await MovieNights.findOne({ messageID: "1027190548555108462" });
    const vt = await mv.getAllVotes();

    console.log(JSON.stringify(vt));
  },
});
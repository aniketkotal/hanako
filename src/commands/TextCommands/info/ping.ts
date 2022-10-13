import { TextCommand } from "../../../structures/Command";
<<<<<<< HEAD
=======
import { MovieNights } from "../../../db/schemas/MovieNights";
>>>>>>> master

export default new TextCommand({
  name: "ping",
  aliases: ["pong"],
<<<<<<< HEAD
  run: async ({ args, message }) => {
    const res = await message.guild.members.search({ query: args.join(" ") });
    console.log(res);
    return "a";
  },
=======
  run: async ({ client, message }) => {},
>>>>>>> master
});

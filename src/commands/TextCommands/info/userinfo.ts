import { TextCommand } from "../../../structures/Command";
import { MovieNights } from "../../../db/schemas/MovieNights";
import { APIEmbed } from "discord.js";

export default new TextCommand({
  name: "userinfo",
  aliases: ["whois"],
  run: async ({ client, message, args }) => {
    // const id = args.length ? args[0].replaceAll(/\D/g, "") : message.author.id;
    // const loadingEmbed: APIEmbed = {
    //   description: "Fetching information...",
    // };
    // const msg = await message.channel.send({ embeds: [loadingEmbed] });
    // try {
    //   let user = await client.users.fetch(id, { force: true });
    // } catch (e) {
    //   console.log(e);
    // }
  },
});

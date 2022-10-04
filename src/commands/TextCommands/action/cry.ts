import { TextCommand } from "../../../structures/Command";
import { prepareSimpleEmbed } from "./helper";

export default new TextCommand({
  name: "cry",
  aliases: [],
  run: async ({ message }) => {
    const embed = await prepareSimpleEmbed(message, "bite");
    return message.reply({ embeds: [embed] });
  },
});

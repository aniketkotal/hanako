import { TextCommand } from "../../../structures/Command";
import { prepareSimpleEmbed } from "./helper";

export default new TextCommand({
  name: "blush",
  aliases: [],
  run: async ({ message }) => {
    const embed = await prepareSimpleEmbed(message, "blush");
    return message.reply({ embeds: [embed] });
  },
});

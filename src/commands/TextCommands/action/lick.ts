import { TextCommand } from "../../../structures/Command";
import { prepareDetailedEmbed } from "./helper";
import { TextCommandType } from "../../../typings/Command";
import { DetailedAction } from "../../../typings/client";

export default new TextCommand({
  name: "lick",
  aliases: [],
  run: async ({ client, message }) => {
    const cmd = this as { default: TextCommandType };
    const embed = await prepareDetailedEmbed(message, cmd.default.name);
    const { error_messages } = client.constants.action_embeds[
      cmd.default.name
    ] as DetailedAction;

    if (!embed) return message.reply(error_messages.NO_USER);

    return message.reply({ embeds: [embed] });
  },
});

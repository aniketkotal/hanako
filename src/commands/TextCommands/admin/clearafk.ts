import { TextCommand } from "../../../structures/Command";
import { AFK } from "../../../db/schemas/AFK";

export default new TextCommand({
  name: "clearafk",
  userPermissions: 8n,
  guildOnly: true,
  run: async ({ message, args, client }) => {
    const user = await message.guild.members.fetch(
      args[0].match(/\d{17,19}/)?.[0]
    );
    if (!user) {
      return client.helpers.replyMessageWithError(
        message,
        client.constants.error_messages.NO_USER_FOUND
      );
    }
    const afk = await AFK.findOne({
      userID: user.id,
      guildID: message.guildId,
    }).exec();

    if (!afk) {
      return client.helpers.replyMessageWithError(
        message,
        client.constants.error_messages.NOT_AFK
      );
    }

    await AFK.deleteOne({
      userID: user.id,
      guildID: message.guildId,
    }).exec();

    return message.reply("The user's AFK has been removed.");
  },
});

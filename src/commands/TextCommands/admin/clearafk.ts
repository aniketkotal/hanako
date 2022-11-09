import { AFK } from "../../../db/schemas/AFK";
import { CommandCategory, TextCommandType } from "../../../typings/command";

const command: TextCommandType = {
  name: "clearafk",
  userPermissions: 8n,
  guildOnly: true,
  usage: "clearafk <UserID/Mention>",
  examples: ["clearafk 123456789012345678", "clearafk <@mention>"],
  description: "Clears a user's AFK status",
  aliases: [],
  category: CommandCategory.ADMIN,
  run: async ({ message, args, client }) => {
    const user = await message.guild.members.fetch(args[0].match(/\d{17,19}/)?.[0]);
    if (!user) {
      await client.helpers.replyMessageWithError(
        message,
        client.constants.error_messages.NO_USER_FOUND,
      );
      return;
    }
    const afk = await AFK.findOne({
      userID: user.id,
      guildID: message.guildId,
    }).exec();

    if (!afk) {
      await client.helpers.replyMessageWithError(message, client.constants.error_messages.NOT_AFK);
      return;
    }

    await AFK.deleteOne({
      userID: user.id,
      guildID: message.guildId,
    }).exec();

    await message.reply("The user's AFK has been removed.");
  },
};

export default command;

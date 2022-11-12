import { APIEmbed } from "discord.js";
import { CommandArgument, CommandCategory, SettingCategories, TextCommandType } from "../../../../typings/command";

const command: TextCommandType = {
  name: "settings",
  aliases: [],
  usage: "settings <setting>",
  examples: [],
  userPermissions: 8n,
  description: "Shows the current settings for the server.",
  category: CommandCategory.ADMIN,
  run: async (inputs) => {
    const { message, args, client } = inputs;
    const {
      constants: { embed_colours: { default: embedColor } },
      helpers: { deleteReactionCollector, addAutoDeleteTimer, errorEmbedBuilder },
    } = client;
    const { guild } = message;
    const [arg] = args;

    if (arg) {
      if (!client.settingModules.has(arg)) {
        throw errorEmbedBuilder({ error: `Setting for \`${args[0]}\` not found` });
      }
      const setting = client.settingModules.get(arg);
      return setting.run({ ...inputs, args: inputs.args.slice(1) });
    }

    const mainEmbed: APIEmbed = {
      author: {
        name: `${guild.name}'s Settings`,
        icon_url: message.guild.iconURL(),
      },
      title: "Server Configuration",
      description:
        "Here are the current settings for this server. " +
        "To view/modify a setting, use `settings <setting>`",
      fields: [],
      color: parseInt(embedColor, 16),
    };

    const settings: Partial<Record<SettingCategories, Array<CommandArgument["argument"]>>> = {};

    // CREATE A RECORD OF ALL COMMANDS
    client.settingModules.reduce((acc: Partial<Record<SettingCategories, Array<CommandArgument["argument"]>>>, {
      category,
      argument,
    }) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(`\`${argument}\``);
      return acc;
    }, settings);

    // CREATE A FIELD FOR EACH SETTING CATEGORY AND PUSH IT TO THE EMBED
    Object.keys(settings).forEach((category) => {
      const commandsList = settings[category as SettingCategories];
      commandsList.sort();
      mainEmbed.fields.push({ name: category, value: commandsList.join(", "), inline: true });
    });

    return mainEmbed;

    // await deleteReactionCollector(
    //   await message.reply({ embeds: [mainEmbed] }), message.author.id, 60000,
    // );
  },
};

export default command;

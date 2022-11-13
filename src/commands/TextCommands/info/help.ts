import { APIEmbed } from "discord.js";
import { Command, CommandCategory, TextCommandType } from "../../../typings/command";
import { ExtendedClient } from "../../../structures/Client";

const command: TextCommandType = {
  name: "help",
  aliases: ["h"],
  usage: "help <command>",
  description: "Shows the help menu for the bot",
  cooldown: 60,
  examples: ["help bite", "help ping"],
  category: CommandCategory.INFO,
  run: async ({ message, client, args }) => {
    const {
      textCommands,
      constants: { embed_colours: { default: embedColor } },
      helpers: { errorEmbedBuilder },
    } = client;

    // IF IT HAS COMMAND ARGUMENT
    if (args[0]) {
      const cmd = textCommands.get(args[0]) || textCommands.find(
        ({ aliases }) => aliases.includes(args[0]),
      );

      if (!cmd) {
        throw errorEmbedBuilder({ error: `Command \`${args[0]}\` not found` });
        // addAutoDeleteTimer(await message.reply(`Command \`${args[0]}\` not found`));
        // return;
      }
      return createCommandHelpEmbed(cmd, client);
      // const msg = await message.reply({ embeds: [embed] });
      // await deleteReactionCollector(msg, message.author.id);
    }

    // IF NO COMMAND ARGUMENT SHOW HELP MENU
    const embed: APIEmbed = {
      author: {
        name: "Hanako's Commands List",
        icon_url: client.user.displayAvatarURL(),
      },
      description: "Here is a list of all the commands!\n" +
        "Need more help? Come join our [support server](https://discord.gg/8cag4EzXfy)!",
      fields: [],
      color: parseInt(embedColor, 16),
      footer: {
        text: `Requested By ${message.author.username}`,
        icon_url: message.author.displayAvatarURL(),
      },
    };

    // {"Info": ["avatar", ...], ...}
    const commands: Partial<Record<CommandCategory, Array<Command["name"]>>> = {};

    // CREATE A RECORD OF ALL COMMANDS
    textCommands.reduce((acc: Partial<Record<CommandCategory, Array<Command["name"]>>>, { category, name }) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(`\`${name}\``);
      return acc;
    }, commands);

    // CREATE A FIELD FOR EACH COMMAND CATEGORY AND PUSH IT TO THE EMBED
    Object.keys(commands).forEach((category) => {
      const commandsList = commands[category as CommandCategory];
      commandsList.sort();
      embed.fields.push({ name: category, value: commandsList.join(", ") });
    });

    return embed;

    // await deleteReactionCollector(
    //   await message.reply({ embeds: [embed] }), message.author.id, 60000,
    // );
  },
};

const createCommandHelpEmbed = (cmd: TextCommandType, client: ExtendedClient) => {
  const {
    name, aliases, usage, description, cooldown, examples, category,
  } = cmd;
  const {
    constants: {
      embed_colours: { default: embedColor },
      client_configurations: { cooldown: { default_cooldown } },
    },
  } = client;

  return {
    author: {
      name: `${name} command`,
      icon_url: client.user.displayAvatarURL(),
    },
    description: description || "No Description provided",
    fields: [
      { name: "Category", value: category, inline: true },
      { name: "Usage", value: `\`${process.env.DEFAULT_PREFIX}${usage}\``, inline: true },
      { name: "Cooldown", value: `${cooldown || default_cooldown} seconds`, inline: true },
      { name: "Aliases", value: aliases.map((i) => `\`${i}\``).join(", ") || "None", inline: true },
      {
        name: "Examples",
        value: examples.map((i) => `\`${process.env.DEFAULT_PREFIX}${i}\``).join(", ") || "None provided",
        inline: false,
      },
    ],
    color: parseInt(embedColor, 16),
  } as APIEmbed;
};

export default command;

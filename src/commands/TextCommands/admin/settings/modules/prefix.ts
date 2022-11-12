import { APIEmbed } from "discord.js";
import { CommandArgument, SettingCategories } from "../../../../../typings/command";

const arg: CommandArgument = {
  argument: "prefix",
  description: "Set prefix for the server",
  usage: ["prefix set ,", "prefix clear"],
  category: SettingCategories.UTILITY,
  run: async ({ message, args, client, guild }) => {
    const {
      constants: { embed_colours: { default: embedColor } },
      helpers: { errorEmbedBuilder },
    } = client;

    const [argument, customPrefix] = args;
    if (argument) {
      if (!["set", "clear"].includes(argument)) {
        throw errorEmbedBuilder(`\`${argument}\` is not a valid command. `
          + "Available arguments: `set` and `clear`");
        // addAutoDeleteTimer(await message.reply());
        // return;
      }
      if (argument === "set") {
        if (!customPrefix) {
          throw errorEmbedBuilder("Please run the command again, except this time with a "
            + "prefix you want to set to.");
          // addAutoDeleteTimer(await message.reply());
          // return;
        }
        const oldPrefix = `${guild.prefix}`;
        if (guild.prefix === customPrefix) {
          throw errorEmbedBuilder("Selected prefix is same as current prefix. Nothing changed.");
          // addAutoDeleteTimer(await message.reply("Selected prefix is same
          // as current prefix. Nothing changed."));
          // return;
        }
        guild.prefix = customPrefix;
        await guild.save();
        const prefixUpdateEmbed: APIEmbed = {
          color: parseInt(embedColor, 16),
          title: `${message.guild.name}'s Prefix Updated`,
          description: `This server's prefix has been updated to \`${customPrefix}\`!`,
          fields: [
            {
              name: "Current Prefix",
              inline: true,
              value: `\`${customPrefix}\``,
            },
            {
              name: "Previous Prefix",
              inline: true,
              value: `\`${oldPrefix}\``,
            },
          ],
        };

        return prefixUpdateEmbed;
        // await message.reply({ embeds: [prefixUpdateEmbed] });
        // return;
      }
      if (argument === "clear") {
        const oldPrefix = `${guild.prefix}`;
        guild.prefix = process.env.DEFAULT_PREFIX;
        await guild.save();
        const prefixUpdateEmbed: APIEmbed = {
          color: parseInt(embedColor, 16),
          title: `${message.guild.name}'s Prefix Updated`,
          description: `This server's prefix has been updated to \`${guild.prefix}\`!`,
          fields: [
            {
              name: "Current Prefix",
              inline: true,
              value: `\`${guild.prefix}\``,
            },
            {
              name: "Previous Prefix",
              inline: true,
              value: `\`${oldPrefix}\``,
            },
          ],
        };

        return prefixUpdateEmbed;
        // await message.reply({ embeds: [prefixUpdateEmbed] });
        // return;
      }
    }

    const { prefix } = guild;

    const embed: APIEmbed = {
      title: `${message.guild.name}'s Prefix Configuration`,
      description: `This server's current prefix is \`${prefix ?? process.env.DEFAULT_PREFIX}\`. `
        + `To change current prefix, run \`prefix set <new-prefix>\`, excluding the \`<\` and \`>\` of course.`,
      color: parseInt(embedColor, 16),
      fields: [
        {
          name: "Current Prefix",
          inline: true,
          value: `\`${prefix ?? process.env.DEFAULT_PREFIX}\``,
        },
        {
          name: "Default Prefix",
          inline: true,
          value: `\`${process.env.DEFAULT_PREFIX}\``,
        },
      ],
    };

    return embed;
    // await message.reply({ embeds: [embed] });
  },
};

export default arg;

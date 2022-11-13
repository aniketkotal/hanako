import { APIEmbed } from "discord.js";
import { CommandArgument, SettingCategories } from "../../../../../typings/command";

const arg: CommandArgument = {
  argument: "cooldown",
  usage: ["cooldown <seconds>"],
  description: "Set default cooldown for the server.",
  category: SettingCategories.UTILITY,
  run: async ({ message, guild, client, args }) => {
    const {
      constants: {
        client_configurations: { cooldown: { default_cooldown } },
        embed_colours: { default: embedColor },
      },
      helpers: { errorEmbedBuilder },
    } = client;

    const secondOrSeconds = (num: number) => num === 1 ? "second" : "seconds";
    const [input] = args;
    if (input) {
      const customCooldown = parseInt(input, 10);
      if (Number.isNaN(customCooldown)) {
        throw errorEmbedBuilder("Please input a number in seconds to set the cooldown to.");
        // addAutoDeleteTimer(await message.reply("Please input a number
        // in seconds to set the cooldown to."));
        // return;
      }
      if (customCooldown > 500) {
        throw errorEmbedBuilder("Cooldown cannot be more than 500 seconds.");
        // addAutoDeleteTimer(await message.reply("Cooldown cannot be more than 500 seconds."));
        // return;
      }
      const oldCooldown = +guild.cooldown;
      if (oldCooldown === customCooldown) {
        throw errorEmbedBuilder("Selected cooldown is same as current cooldown. Nothing changed.");
        // addAutoDeleteTimer(await message.reply("Cooldown is already
        // set to that. No changes were made."));
        // return;
      }
      guild.cooldown = customCooldown;
      await guild.save();
      const cooldownUpdateEmbed: APIEmbed = {
        color: parseInt(embedColor, 16),
        title: `${message.guild.name}'s Cooldown Updated`,
        description: `Cooldown has been updated to \`${customCooldown}\` ${secondOrSeconds(customCooldown)}.`,
        fields: [
          {
            name: "Current Cooldown",
            inline: true,
            value: `\`${customCooldown}\` ${secondOrSeconds(customCooldown)}`,
          },
          {
            name: "Previous Cooldown",
            inline: true,
            value: `\`${oldCooldown ?? default_cooldown}\` ${secondOrSeconds(oldCooldown ?? default_cooldown)}`,
          },
        ],
      };

      return cooldownUpdateEmbed;
      // await message.reply({ embeds: [cooldownUpdateEmbed] });
      // return;
    }

    const { cooldown } = guild;

    const embed: APIEmbed = {
      title: `${message.guild.name}'s Cooldown Configuration`,
      description: `Current cooldown is \`${cooldown ?? default_cooldown}\` ${secondOrSeconds(cooldown)}`,
      color: parseInt(embedColor, 16),
      fields: [
        {
          name: "Current Cooldown",
          inline: true,
          value: `\`${cooldown ?? default_cooldown}\` ${secondOrSeconds(cooldown ?? default_cooldown)}`,
        },
        {
          name: "Default Cooldown",
          inline: true,
          value: `\`${default_cooldown}\` ${secondOrSeconds(default_cooldown)}`,
        },
      ],
    };

    return embed;
    // await message.reply({ embeds: [embed] });
  },
};

export default arg;

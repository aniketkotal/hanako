import { ActionNames, DetailedActionNames, SimpleActionNames } from "../../typings/client";
import { ActionCommandType, CommandCategory } from "../../typings/command";
import { prepareDetailedEmbed, prepareSimpleEmbed } from "../../commands/TextCommands/action/constructor";

export default () => {
  const additionalActionGIFs: Partial<Record<ActionNames, [string, ...string[]]>> = {
    punch: [
      "https://media.tenor.com/p_mMicg1pgUAAAAC/anya-forger-damian-spy-x-family.gif",
      "https://media.tenor.com/gmvdv-e1EhcAAAAC/weliton-amogos.gif",
      "https://media.tenor.com/SwMgGqBirvcAAAAC/saki-saki-kanojo-mo-kanojo.gif",
      "https://media.tenor.com/qDDsivB4UEkAAAAC/anime-fight.gif",
      "https://media.tenor.com/Ws6Dm1ZW_vMAAAAC/girl-slap.gif",
      "https://media.tenor.com/o8RbiF5-9dYAAAAd/killua-hxh.gif",
      "https://media.tenor.com/ObgxhbfdVCAAAAAd/luffy-anime.gif",
    ],
  };

  const actionAliases: Partial<Record<ActionNames, [string, ...string[]]>> = {
    kiss: ["kith", "kissu"],
  };

  const detailedActions = Object.values(DetailedActionNames).map(action => {
    const cmd: ActionCommandType = {
      name: action,
      category: CommandCategory.ACTION,
      usage: `${action} <mention/nickname/username>`,
      description: `${action} someone(or yourself?)!`,
      examples: [`${action} @mention`, `${action} hanako`],
      aliases: actionAliases[action] || [],
      async run({ message, args, client: cmdCLient }) {
        const { helpers: { errorEmbedBuilder } } = cmdCLient;
        const embed = await prepareDetailedEmbed(
          message,
          action,
          args,
          cmdCLient,
          this.gifs,
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { error_messages } = cmdCLient.constants.action_embeds[this.name];

        if (!embed) {
          throw errorEmbedBuilder({ error: error_messages.NO_USER });
          // await message.reply(error_messages.NO_USER);
          // return;
        }
        return embed;
        // await message.reply({ embeds: [embed] });
      },
    };
    if (additionalActionGIFs[action]?.length) {
      cmd.gifs = [...additionalActionGIFs[action]];
    }
    return cmd;
  });

  const simpleActions = Object.values(SimpleActionNames).map(action => {
    const cmd: ActionCommandType = {
      name: action,
      category: CommandCategory.ACTION,
      aliases: actionAliases[action] || [],
      usage: `${action}`,
      description: `no description..`,
      examples: [`${action}`],
      async run({ message, client: cmdClient }) {
        const embed = await prepareSimpleEmbed(
          message,
          action,
          cmdClient,
          this.gifs,
        );
        return embed;
        // await message.reply({ embeds: [embed] });
      },
    };
    if (additionalActionGIFs[action]?.length) {
      cmd.gifs = [...additionalActionGIFs[action]];
    }

    return cmd;
  });

  return [...detailedActions, ...simpleActions];
};

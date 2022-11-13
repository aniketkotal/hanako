import {
  ApplicationCommandOptionType, GuildMember,
} from "discord.js";
import { ActionNames, DetailedActionNames, SimpleActionNames } from "../../typings/client";
import { InteractionActionCommandType } from "../../typings/command";
import helpers from "../../commands/SlashCommands/action/constructor";

const { prepareDetailedInteractionEmbed, prepareSimpleInteractionEmbed } = helpers;

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

export default () => {
  const detailedActions = Object.values(DetailedActionNames).map(action => {
    const cmd: InteractionActionCommandType = {
      name: action,
      description: `${action} someone(or yourself?)!`,
      type: 1,
      options: [
        {
          name: "user",
          description: "The user you want to perform the action on",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
      async run({ interaction, client: cmdCLient }) {
        const mention = interaction.options.getMember("user") as GuildMember;

        return prepareDetailedInteractionEmbed(
          mention,
          interaction.member,
          action,
          cmdCLient,
          this.gifs,
        );
      },
    };
    if (additionalActionGIFs[action]?.length) {
      cmd.gifs = [...additionalActionGIFs[action]];
    }
    return cmd;
  });

  const simpleActions = Object.values(SimpleActionNames).map(action => {
    const cmd: InteractionActionCommandType = {
      name: action,
      description: `Action command for ${action}ing`,
      type: 2,
      async run({ interaction, client: cmdClient }) {
        return prepareSimpleInteractionEmbed(
          interaction.member,
          action,
          cmdClient,
          this.gifs,
        );
      },
    };
    if (additionalActionGIFs[action]?.length) {
      cmd.gifs = [...additionalActionGIFs[action]];
    }

    return cmd;
  });

  return [...detailedActions, ...simpleActions];
};

// export default () => {
//   const actions = actionConstructor();
//   return {
//     name: "action",
//     options: [...actions],
//   };
// };

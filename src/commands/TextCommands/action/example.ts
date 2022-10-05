// import { ActionTextCommand } from "../../../structures/Command";
// import { prepareDetailedEmbed } from "./actionCommandConstructor";
// import { ActionCommandType } from "../../../typings/Command";
// import { DetailedAction } from "../../../typings/client";
//
// DETAILED ACTION COMMAND EXAMPLE
// export default new ActionTextCommand({
//   name: "bite",
//   aliases: [],
//   async run({ client, message }) {
//     const cmdProps = this as ActionCommandType;
//     const embed = await prepareDetailedEmbed(
//       message,
//       cmdProps.name,
//       cmdProps.gifs
//     );
//     const { error_messages } = client.constants.action_embeds[
//       cmdProps.name
//     ] as DetailedAction;
//
//     if (!embed) return message.reply(error_messages.NO_USER);
//
//     return message.reply({ embeds: [embed] });
//   },
// });
//
//
// SIMPLE ACTION COMMAND EXAMPLE
// import { TextCommand } from "../../../structures/Command";
// import { prepareSimpleEmbed } from "./actionCommandConstructor";
//
// export default new TextCommand({
//   name: "blush",
//   aliases: [],
//   run: async ({ message }) => {
//     const embed = await prepareSimpleEmbed(message, "blush");
//     return message.reply({ embeds: [embed] });
//   },
// });

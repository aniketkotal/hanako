import { Command } from "../../structures/Command";

export default new Command({
  name: "muffins",
  description: "replies with pong",
  run: async ({ interaction }) => {
    interaction.followUp("moofins*");
  },
});

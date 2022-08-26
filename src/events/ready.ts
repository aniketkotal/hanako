import { Event } from "../structures/Events";

export default new Event("ready", () => {
  console.log("Bot is online!");
});

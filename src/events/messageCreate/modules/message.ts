import { Message } from "discord.js";

export const sayHi = (text: string) => {
  return (...a: any) => console.log(text, a);
};
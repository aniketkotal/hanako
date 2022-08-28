import chalk from "chalk";

export class Logger {
  static infoColour = chalk.bold.blue;
  static errorColour = chalk.bold.red;

  static info(text: string | Error): void {
    console.log(this.infoColour("[INFO]") + text);
  }

  static error(text: string | Error): void {
    console.log(this.errorColour("[ERROR]") + text);
  }
}

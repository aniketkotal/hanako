import chalk from "chalk";

export class Logger {
  static dashedLine = "------x------";
  static infoColour = chalk.bold.blue;
  static errorColour = chalk.bold.red;

  static info(text: string): void {
    console.log(this.infoColour("[INFO] ") + text);
  }

  static error(error: string | Error): void {
    if (typeof error === "string") {
      console.log(this.errorColour("[ERROR] ") + error);
    } else {
      console.log(this.errorColour("[ERROR] ") + error.message);
      console.log(error);
      console.log(this.dashedLine);
    }
  }
}

import chalk from "chalk";

export class Logger {
  static dashedLine = "------x------";
  static infoColour = chalk.blue;
  static errorColour = chalk.red;
  static loadedColour = chalk.greenBright;
  static eventColour = chalk.blueBright;
  static actionColour = chalk.cyanBright;

  static info(text: string): void {
    console.log(this.infoColour("[INFO] ") + text);
  }

  static error(error: string | Error): void {
    if (typeof error === "string") {
      console.error(this.errorColour("[ERROR] ") + error);
    } else {
      console.log(this.errorColour("[ERROR] ") + error.message);
      console.error(error);
      console.log(this.dashedLine);
    }
  }

  static moduleLoaded(moduleName: string): void {
    console.log(`${this.loadedColour("[+] Module ") + moduleName} loaded!`);
  }

  static eventLoaded(eventName: string): void {
    console.log(`${this.eventColour("[+] Event  ") + eventName} loaded!`);
  }

  static actionLoaded(actionName: string): void {
    console.log(`${this.actionColour("[+] Action ") + actionName} loaded!`);
  }
}

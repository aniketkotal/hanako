export class Logger {
  static info(text: string): void {
    console.log(`[INFO] ${text}`);
  }
  static error(text: string): void {
    console.log(`[ERROR] ${text}`);
  }
}

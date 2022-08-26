declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      guildID: string;
      environment: "dev" | "prod" | "debug";
    }
  }
}

export {};

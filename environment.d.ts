declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      guildID: string;
      environment: "dev" | "prod" | "debug";
      dbURL: string;
      dbPort: string;
      dbName: string;
      botOwners: string; // "123456789, 123456789"
    }
  }
}

export {};

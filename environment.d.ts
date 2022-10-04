declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      guildID: string;
      environment: "dev" | "prod" | "debug";
      dbURL: string;
      dbPort: string;
      dbName: string;
      OWNER_IDS: string; // "123456789, 123456789"
      DB_PASSWORD: string;
      DEFAULT_PREFIX: string;
    }
  }
}

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      guildID: string;
      environment: "dev" | "prod" | "debug";
<<<<<<< HEAD
      DB_URL: string;
      DB_PORT: string;
      DB_NAME: string;
=======
      dbURL: string;
      dbPort: string;
      dbName: string;
>>>>>>> master
      OWNER_IDS: string; // "123456789, 123456789"
      DB_PASSWORD: string;
      DEFAULT_PREFIX: string;
    }
  }
}

export {};

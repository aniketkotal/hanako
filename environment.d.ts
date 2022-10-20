declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      GUILD_ID: string;
      ENVIRONMENT: "dev" | "prod";
      DB_URL: string;
      DB_PORT: string;
      DB_NAME: string;
      OWNER_IDS: string; // "123456789, 123456789"
      DB_PASSWORD: string;
      DEFAULT_PREFIX: string;
    }
  }
}

export {};

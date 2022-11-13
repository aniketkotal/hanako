declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      MOVIE_GUILD_ID: string;
      MOVIE_ANNOUNCE_CHANNEL_ID: string;
      MOVIE_ANNOUNCE_ROLE_ID: string;
      MOVIE_ANNOUNCE_VC_ID: string;
      ENVIRONMENT: "dev" | "prod";
      DB_URL: string;
      OWNER_IDS: string; // "123456789, 123456789"
      DEFAULT_PREFIX: string;
    }
  }
}

export {};

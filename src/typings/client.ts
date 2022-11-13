export enum DetailedActionNames {
  BITE = "bite",
  CUDDLE = "cuddle",
  DANCE = "dance",
  FEED = "feed",
  HUG = "hug",
  KISS = "kiss",
  PAT = "pat",
  POKE = "poke",
  SLAP = "slap",
  TICKLE = "tickle",
  FLUFF = "fluff",
  LICK = "lick",
  SHOOT = "shoot",
  STARE = "stare",
  KICK = "kick",
  PUNCH = "punch",
  YEET = "yeet",
}

export enum SimpleActionNames {
  BLUSH = "blush",
  CRY = "cry",
  SMILE = "smile",
  POUT = "pout",
}

export type ActionNames = DetailedActionNames | SimpleActionNames;
// const actionNames = { ...DetailedActionNames, ...SimpleActionNames };

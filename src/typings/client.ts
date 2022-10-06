import { ApplicationCommandDataResolvable } from "discord.js";

export interface RegisterCommandsOptions {
  guildID?: string;
  commands: ApplicationCommandDataResolvable[];
}

export interface Constant {
  movie_night: Movienight;
  movie_votes: MovieVotes;
  error_messages: ConstantErrorMessages;
  gif_endpoints: GIFEndpoints;
  action_embeds: ActionEmbeds;
}

export interface ActionEmbeds {
  bite: DetailedAction;
  blush: SimpleEmbed;
  cry: SimpleEmbed;
  cuddle: DetailedAction;
  dance: DetailedAction;
  feed: DetailedAction;
  hug: DetailedAction;
  kiss: DetailedAction;
  pat: DetailedAction;
  poke: DetailedAction;
  slap: DetailedAction;
  smile: SimpleEmbed;
  tickle: DetailedAction;
  fluff: DetailedAction;
  lick: DetailedAction;
  kick: DetailedAction;
  pout: SimpleEmbed;
  punch: DetailedAction;
  stare: DetailedAction;
}

export interface DetailedAction {
  embed_details: DetailedEmbedDetails;
  error_messages: ActionEmbedErrorMessages;
}

export interface DetailedEmbedDetails {
  color: string;
  title: Title;
  footer: string;
}

export interface Title {
  normal: string;
  self: string;
}

export interface ActionEmbedErrorMessages {
  NO_USER: string;
}

export interface SimpleEmbed {
  embed_details: SimpleEmbedDetails;
}

export interface SimpleEmbedDetails {
  color: string;
  title: string;
}

export interface ConstantErrorMessages {
  OWNER_ONLY: string;
  GUILD_ONLY: string;
  NO_VOTES: string;
  MOVIE_NIGHT_NOT_FOUND: string;
}

export interface GIFEndpoints {
  common: string[];
  purrbot: string[];
  neko: string[];
}

export interface MovieVotes {
  embed_texts: EmbedTexts;
  messages: MovieVoteMessages;
}

export interface MovieVotesEmbedTexts {
  title: string;
  description: string;
  footer: string;
}

export interface Movienight {
  allowed_mnight_users_id: string[];
  embed_texts: MovienightEmbedTexts;
  messages: Messages;
  timeouts: Timeouts;
  button_text: ButtonText[];
  vote_emotes: string[];
}

export interface ButtonText {
  labelSuccess: string;
  labelCancel: string;
}

export interface MovienightEmbedTexts {
  all_variations: AllVariation[];
  footer_since: string;
  footer_until: string;
  owner_message_texts: {
    title: string;
    description: string;
  };
}

export interface AllVariation {
  color: number;
  title: string;
  description: string;
}

export interface EmbedTexts {
  title: string;
  description: string;
  fields: Fields;
  footer: string;
}

export interface Fields {
  title: string;
}

export interface MovieVoteMessages {
  on_vote_add: string;
  on_vote_update: string;
}

export interface Messages {
  embed_preview_message: string;
  on_ok: string;
  on_success: string;
  on_cancel: string;
  on_timeout: string;
  message_on_finish: string;
  owner_message_on_finish: string;
}

export interface Timeouts {
  preview_embed: number;
  default: number;
}

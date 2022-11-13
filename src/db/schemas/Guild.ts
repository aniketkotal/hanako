import { Document, model, Schema } from "mongoose";

export interface GuildInterface extends Document {
  guildID: string;
  prefix: string;
  cooldown: number;
}

const guildSchema: Schema<GuildInterface> = new Schema({
  guildID: {
    type: String,
    required: true,
    unique: true,
  },
  prefix: {
    type: String,
    required: false,
  },
  cooldown: {
    type: Number,
    required: false,
  },
});

export const Guild = model<GuildInterface>("Guilds", guildSchema, "Guilds");

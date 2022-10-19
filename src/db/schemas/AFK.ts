import { model, Schema, Model, Document } from "mongoose";

interface AFK extends Document {
  userID: string;
  guildID: string;
  message: string;
  timestampSince: number;
}

const afkSchema = new Schema<AFK>(
  {
    guildID: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    timestampSince: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AFK = model<AFK>("AFK", afkSchema, "AFK");

import { Document, Model, model, Schema } from "mongoose";
import { ActionNames } from "../../typings/client";

export interface UserInterface {
  userID: string;
  prefix: string;
  disabledActions: ActionNames[];
  botMeta: {
    banned: {
      isBanned: boolean;
      banReason: string;
    };
    skipsCooldown: boolean;
  };
  commandsRan: Record<string, number>;
}

export interface UserDocument extends UserInterface, Document {
  actionCounts: Record<ActionNames, Record<string, number>>;
}

// export interface UserModel extends Model<UserDocument> {}

const userSchema: Schema<UserDocument> = new Schema(
  {
    userID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    prefix: {
      type: String,
      required: false,
      default: process.env.DEFAULT_PREFIX,
    },
    disabledActions: {
      type: [String],
      required: false,
      default: [],
    },
    botMeta: {
      banned: {
        isBanned: {
          type: Boolean,
          required: false,
          default: false,
        },
        banReason: {
          type: String,
          required: false,
          default: "",
        },
      },
      skipsCooldown: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    commandsRan: {
      type: Object,
      required: false,
      default: {},
    },
  },
  {
    virtuals: {
      actionCount: {
        options: {
          ref: "ActionCounts",
          localField: "userID",
          foreignField: "userID",
        },
      },
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

export const User = model<UserDocument>("Users", userSchema, "Users");

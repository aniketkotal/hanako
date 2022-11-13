import { model, Schema, Model, Document, ObjectId } from "mongoose";
import { ActionNames } from "../../typings/client";

type Actions = Record<ActionNames, Map<string, number>>;

export interface ActionCounts extends Document, Actions {
  userID: string;
}

export interface ActionCountDocument extends ActionCounts, Document {
  _id: ObjectId;
  getCount: (actionType: string, victimID: string) => Map<string, number>;
  increaseActionCountByOne: (actionType: string, victimID: string) => Promise<number>;
}

interface ActionCountModel extends Model<ActionCountDocument> {
  initialiseActionCountInDB: (userID: string) => Promise<ActionCountDocument>;
}

const actionCountsSchema: Schema<ActionCountDocument> = new Schema(
  {
    userID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    bite: {
      type: Map,
      of: String,
      required: false,
    },
    cuddle: {
      type: Map,
      of: String,
      required: false,
    },
    dance: {
      type: Map,
      of: String,
      required: false,
    },
    feed: {
      type: Map,
      of: String,
      required: false,
    },
    hug: {
      type: Map,
      of: String,
      required: false,
    },
    kiss: {
      type: Map,
      of: String,
      required: false,
    },
    pat: {
      type: Map,
      of: String,
      required: false,
    },
    poke: {
      type: Map,
      of: String,
      required: false,
    },
    slap: {
      type: Map,
      of: String,
      required: false,
    },
    tickle: {
      type: Map,
      of: String,
      required: false,
    },
    fluff: {
      type: Map,
      of: String,
      required: false,
    },
    lick: {
      type: Map,
      of: String,
      required: false,
    },
    kick: {
      type: Map,
      of: String,
      required: false,
    },
    pout: {
      type: Map,
      of: String,
      required: false,
    },
    shoot: {
      type: Map,
      of: String,
      required: false,
    },
    stare: {
      type: Map,
      of: String,
      required: false,
    },
    yeet: {
      type: Map,
      of: String,
      required: false,
    },
  },
  {
    methods: {
      getCount(actionType: ActionNames, victimID: string) {
        return this[actionType].get(victimID);
      },
      async increaseActionCountByOne(actionType: ActionNames, victimID: string) {
        if (!this[actionType]) this[actionType] = new Map();
        const actionCounts = this[actionType];

        actionCounts.set(victimID, Number(actionCounts.get(victimID) || 0) + 1);
        this[actionType] = actionCounts;
        const user = await this.save();
        return +user.getCount(actionType, victimID);
      },
    },
    statics: {
      async initialiseActionCountInDB(userID: string) {
        return new ActionCount({
          userID,
        }).save();
      },
    },
    timestamps: true,
  },
);

export const ActionCount = model<ActionCountDocument, ActionCountModel>(
  "ActionCounts",
  actionCountsSchema,
  "ActionCounts",
);

import { model, Schema, Model, Document, ObjectId } from "mongoose";
<<<<<<< HEAD
import { ActionNames } from "../../typings/client";

type Actions = Record<ActionNames, Map<string, number>>;

export interface ActionCounts extends Document, Actions {
  userID: string;
=======

export interface ActionCounts extends Document {
  userID: string;
  bite: Map<string, number>;
  cuddle: Map<string, number>;
  dance: Map<string, number>;
  feed: Map<string, number>;
  hug: Map<string, number>;
  kiss: Map<string, number>;
  pat: Map<string, number>;
  poke: Map<string, number>;
  slap: Map<string, number>;
  tickle: Map<string, number>;
  fluff: Map<string, number>;
  lick: Map<string, number>;
  kick: Map<string, number>;
  pout: Map<string, number>;
  shoot: Map<string, number>;
  stare: Map<string, number>;
  yeet: Map<string, number>;
>>>>>>> master
}

export interface ActionCountDocument extends ActionCounts, Document {
  _id: ObjectId;
  getCount: (actionType: string, victimID: string) => Map<string, number>;
  increaseActionCountByOne: (
    actionType: string,
    victimID: string
  ) => Promise<number>;
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
<<<<<<< HEAD
      getCount: function (actionType: ActionNames, victimID: string) {
        return this[actionType].get(victimID);
      },
      increaseActionCountByOne: async function (
        actionType: ActionNames,
        victimID: string
      ) {
        const actionCounts = this[actionType];
        actionCounts.set(victimID, Number(actionCounts.get(victimID) || 0) + 1);
        this[actionType] = actionCounts;
        const user = await this.save();
        return +user.getCount(actionType, victimID);
=======
      getCount: function (actionType: string, victimID: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return this[actionType].get(victimID);
      },
      increaseActionCountByOne: async function (
        actionType: string,
        victimID: string
      ) {
        const actionCounts = this[actionType] as Map<string, number>;
        actionCounts.set(victimID, Number(actionCounts.get(victimID) || 0) + 1);
        this[actionType] = actionCounts;
        const user = await this.save();
        return user.getCount(actionType, victimID);
>>>>>>> master
      },
    },
    statics: {
      async initialiseActionCountInDB(userID: string) {
        return new ActionCount({
          userID,
          bite: new Map(),
          cuddle: new Map(),
          dance: new Map(),
          feed: new Map(),
          hug: new Map(),
          kiss: new Map(),
          pat: new Map(),
          poke: new Map(),
          slap: new Map(),
          tickle: new Map(),
          fluff: new Map(),
          lick: new Map(),
          kick: new Map(),
          pout: new Map(),
          shoot: new Map(),
          stare: new Map(),
          yeet: new Map(),
        }).save();
      },
    },
<<<<<<< HEAD
    timestamps: true,
=======
>>>>>>> master
  }
);

export const ActionCount = model<ActionCountDocument, ActionCountModel>(
  "ActionCounts",
  actionCountsSchema,
  "ActionCounts"
);

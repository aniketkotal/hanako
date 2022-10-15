import { sequelize } from "../index";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { ActionNames } from "../../typings/client";

interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
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

export const User = sequelize.define<UserModel>(
  "Users",
  {
    userID: {
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false,
    },
    prefix: {
      type: DataTypes.STRING,
      defaultValue: "!",
    },
    disabledActions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    botMeta: {
      type: DataTypes.JSON,
      defaultValue: {
        banned: {
          isBanned: false,
          banReason: "",
        },
        skipsCooldown: false,
      },
    },
    commandsRan: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
  }
);

import { Column, Model, Table } from "sequelize-typescript";
import { Snowflake } from "discord.js";

export interface BotMeta {
  banned: {
    isBanned: false;
    banReason: "";
  };
  skipsCooldown: false;
}

@Table
export class User extends Model<User> {
  @Column({
    primaryKey: true,
    unique: true,
  })
  userID: Snowflake;

  @Column({
    defaultValue: "!",
  })
  prefix: string;

  @Column({
    defaultValue: [],
  })
  disabledActions: string;

  @Column({
    defaultValue: JSON.stringify({
      banned: {
        isBanned: false,
        banReason: "",
      },
      skipsCooldown: false,
    }),
  })
  botMeta: string;

  @Column({
    defaultValue: {},
  })
  commandsRan: string;
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  deviceId: string;
  username: string;
  avatar: string;
  coins: number;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String, default: 'dY -' },
    coins: { type: Number, default: 2500 }, // Starting coins
    level: { type: Number, default: 1 },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

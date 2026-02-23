// server/models/User.ts
import mongoose, { type Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export const User =
  (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as mongoose.Model<IUser>

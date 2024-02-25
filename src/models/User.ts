import { NextFunction } from "express";
import mongoose from "mongoose";

interface Social {
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
  followedTags: mongoose.Types.ObjectId[];
  blockedTags: mongoose.Types.ObjectId[];
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  roles: "Admin" | "User" | "Bot";
  fullname?: string;
  profilePict?: string;
  phoneNumber?: number;
  isOauth: boolean;
  lastLogin: Date;
  bio?: string;
  social: Social;
  createdAt: Date;
  updatedAt: Date;
}

interface UserDocument extends IUser, mongoose.Document {}

interface IUserModel extends mongoose.Model<UserDocument> {
  createUser: (data: Partial<IUser>) => Promise<UserDocument>;
}

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: [true, "username is required"], unique: true, index: true },
    email: { type: String, required: [true, "email is required"], unique: true, lowercase: true },
    password: { type: String, minlength: [5, "password must be at least 5 characters long"] },
    roles: { type: String, enum: ["Admin", "User", "Bot"], default: "User" },
    fullname: { type: String, maxlength: [100, "fullname maximal 100 characters long"] },
    profilePict: { type: String },
    phoneNumber: { type: Number },
    isOauth: { type: Boolean, required: [true, "isOauth is required"] },
    lastLogin: { type: Date },
    bio: { type: String },
    social: {
      following: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
      followers: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
      savedPosts: { type: [mongoose.SchemaTypes.ObjectId], ref: "Post", default: [] },
      followedTags: { type: [mongoose.SchemaTypes.ObjectId], ref: "Tag", default: [] },
      blockedTags: { type: [mongoose.SchemaTypes.ObjectId], ref: "Tag", default: [] },
    },
  },
  { timestamps: true }
);

// * Buat aja static semuanya nanti kalo dibenerin lagi
UserSchema.statics.createUser = async function (data: Partial<IUser>) {
  return await new this(data).save();
};

const User = mongoose.model<UserDocument, IUserModel>("User", UserSchema);

export default User;

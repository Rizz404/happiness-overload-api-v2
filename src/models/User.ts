import { Document, Schema, SchemaTypes, Types, model } from "mongoose";

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
  social: {
    following: Types.ObjectId[];
    followers: Types.ObjectId[];
    savedPosts: Types.ObjectId[];
    followedTags: Types.ObjectId[];
    blockedTags: Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UserDocument extends IUser, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 5 },
    roles: { type: String, enum: ["Admin", "User", "Bot"], default: "User" },
    fullname: { type: String, maxlength: 100 },
    profilePict: { type: String },
    phoneNumber: { type: Number },
    isOauth: { type: Boolean, required: true },
    lastLogin: { type: Date },
    bio: { type: String },
    social: {
      following: { type: [SchemaTypes.ObjectId], ref: "User", default: [] },
      followers: { type: [SchemaTypes.ObjectId], ref: "User", default: [] },
      savedPosts: { type: [SchemaTypes.ObjectId], ref: "Post", default: [] },
      followedTags: { type: [SchemaTypes.ObjectId], ref: "Tag", default: [] },
      blockedTags: { type: [SchemaTypes.ObjectId], ref: "Tag", default: [] },
    },
  },
  { timestamps: true }
);

export default model<UserDocument>("User", UserSchema);

import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  roles: "Admin" | "User" | "Bot";
  fullname: string;
  profilePict: string;
  phoneNumber: number;
  isOauth: boolean;
  lastLogin: Date;
  bio: string;
  social: Social;
  createdAt: Date;
  updatedAt: Date;
}

interface Social {
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
  followedTags: mongoose.Types.ObjectId[];
  followedInterests: mongoose.Types.ObjectId[];
  blockedTags: mongoose.Types.ObjectId[];
}

export interface UserDocument extends IUser, mongoose.Document {}

export type TCreateUser = Pick<IUser, "username" | "email" | "password" | "isOauth"> &
  Partial<Pick<IUser, "roles">>;

export interface IUserModel extends mongoose.Model<UserDocument> {
  createUser: (data: TCreateUser) => Promise<UserDocument>;
}

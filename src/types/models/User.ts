import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  role: "Admin" | "User" | "Bot";
  fullname: string;
  profilePicture?: string;
  phoneNumber?: number;
  isOauth?: boolean;
  lastLogin: Date;
  bio?: string;
  followings: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  savedPosts: mongoose.Types.ObjectId[];
  followedTags: mongoose.Types.ObjectId[];
  blockedTags: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, mongoose.Document {}

export type TCreateUser = Pick<
  IUser,
  "username" | "email" | "password" | "isOauth"
> &
  Partial<Pick<IUser, "role">>;

export interface UserQueryHelpers {
  excludeSensitive(): mongoose.Query<any, UserDocument> & UserQueryHelpers;
}

export interface UserModel
  extends mongoose.Model<UserDocument, UserQueryHelpers> {
  createUser: (data: TCreateUser) => Promise<UserDocument>;
}

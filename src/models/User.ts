import mongoose from "mongoose";
import { IUser, IUserModel, TCreateUser, UserDocument } from "../types/User";

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: [true, "username is required"], unique: true, index: true },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    password: { type: String, minlength: [5, "password must be at least 5 characters"] },
    roles: { type: String, enum: ["Admin", "User", "Bot"], default: "User" },
    fullname: { type: String, maxlength: [100, "fullname must be a maximum of 100 characters"] },
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
UserSchema.statics.createUser = async function (data: TCreateUser) {
  return await new this(data).save();
};

const User = mongoose.model<UserDocument, IUserModel>("User", UserSchema);

export default User;

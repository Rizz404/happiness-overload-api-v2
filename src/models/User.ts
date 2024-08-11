import mongoose from "mongoose";
import {
  TCreateUser,
  UserDocument,
  UserModel,
  UserQueryHelpers,
} from "../types/models/User";

const UserSchema = new mongoose.Schema<
  UserDocument,
  UserModel,
  {},
  UserQueryHelpers
>(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      index: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [5, "password must be at least 5 characters"],
    },
    role: { type: String, enum: ["Admin", "User", "Bot"], default: "User" },
    fullname: {
      type: String,
      maxlength: [100, "fullname must be a maximum of 100 characters"],
    },
    profilePicture: {
      type: String,
      default:
        "https://i.pinimg.com/originals/50/a6/08/50a608d8797254065ad20bf77c619369.gif",
    },
    phoneNumber: { type: Number },
    bio: { type: String },
    followings: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "User",
      default: [],
    },
    followers: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "User",
      default: [],
    },
    savedPosts: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Post",
      default: [],
    },
    followedTags: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Tag",
      default: [],
    },
    blockedTags: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Tag",
      default: [],
    },
    isOauth: { type: Boolean, required: [true, "isOauth is required"] },
    lastLogin: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const sensitiveFields = [
  "-followings",
  "-followers",
  "-savedPosts",
  "-followedTags",
  "-blockedTags",
  "-password",
];

// @ts-ignore
UserSchema.query.excludeSensitive = function (this: mongoose.Query<any, any>) {
  return this.select(sensitiveFields.join(" "));
};

// * Buat aja static semuanya nanti kalo dibenerin lagi
UserSchema.statics.createUser = async function (data: TCreateUser) {
  return await new this(data).save();
};

UserSchema.virtual("followerCount").get(function () {
  return Array.isArray(this.followers) ? this.followers.length : 0;
});

UserSchema.virtual("followingCount").get(function () {
  return Array.isArray(this.followings) ? this.followings.length : 0;
});

UserSchema.virtual("savedPostCount").get(function () {
  return Array.isArray(this.savedPosts) ? this.savedPosts.length : 0;
});

UserSchema.virtual("followedTagCount").get(function () {
  return Array.isArray(this.followedTags) ? this.followedTags.length : 0;
});

UserSchema.virtual("blockedTagCount").get(function () {
  return Array.isArray(this.blockedTags) ? this.blockedTags.length : 0;
});

const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);

export default User;

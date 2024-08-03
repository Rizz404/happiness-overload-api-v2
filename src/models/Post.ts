import mongoose from "mongoose";
import { IPostModel, PostDocument, TCreatePost } from "../types/models/Post";

const PostSchema = new mongoose.Schema<PostDocument>(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "user ID is required"],
    },
    title: { type: String, required: [true, "title is required"], index: true },
    interest: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Interest",
      required: [true, "interest is required"],
    },
    tags: {
      type: [mongoose.SchemaTypes.ObjectId],
      required: [true, "tags is required"],
      ref: "Tag",
      default: [],
    },
    images: { type: [String] },
    description: { type: String },
    upvotes: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "User",
      default: [],
    },
    downvotes: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "User",
      default: [],
    },
    comments: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Comment",
      default: [],
    },
    cheers: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

PostSchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});

PostSchema.virtual("downvoteCount").get(function () {
  return this.downvotes.length;
});

PostSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

PostSchema.statics.createPost = async function (data: TCreatePost) {
  return await new this(data).save();
};

const Post = mongoose.model<PostDocument, IPostModel>("Post", PostSchema);

export default Post;

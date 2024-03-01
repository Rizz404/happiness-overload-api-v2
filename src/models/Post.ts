import mongoose from "mongoose";

export interface IPost {
  user: mongoose.Types.ObjectId; // * Populated makanya namanya user bukan userId
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  images?: string[];
  description?: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  cheers: mongoose.Types.ObjectId[];
  commentsCount: number;
}

export interface PostDocument extends IPost, mongoose.Document {}

interface IPostModel extends mongoose.Model<PostDocument> {
  createPost: (data: Partial<IPost>) => Promise<PostDocument>;
}

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
    upvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    downvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    cheers: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.statics.createPost = async function (data: Partial<IPost>) {
  return await new this(data).save();
};

const Post = mongoose.model<PostDocument, IPostModel>("Post", PostSchema);

export default Post;

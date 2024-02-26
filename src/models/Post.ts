import mongoose from "mongoose";

export interface IPost {
  user: mongoose.Types.ObjectId; // * Populated makanya namanya user bukan userId
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  images?: string[];
  description?: string;
  upvotes: mongoose.Types.ObjectId[];
  upvotesCount: number;
  downvotes: mongoose.Types.ObjectId[];
  downvotesCount: number;
  cheers: mongoose.Types.ObjectId[];
  cheersCount: number;
  commentsCount: number;
}

interface PostDocument extends IPost, mongoose.Document {}

interface IPostModel extends mongoose.Model<PostDocument> {
  createPost: (data: Partial<IPost>) => Promise<PostDocument>;
  // findSelectedAndPopulatedPosts: (filter?: any) => mongoose.Query<PostDocument[], PostDocument>;
}

const PostSchema = new mongoose.Schema<PostDocument>(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "user ID is required"],
    },
    title: { type: String, required: [true, "title is required"], index: true },
    interest: { type: mongoose.SchemaTypes.ObjectId, ref: "Tag", required: true },
    tags: { type: [mongoose.SchemaTypes.ObjectId], ref: "Tag", default: [] },
    images: { type: [String] },
    description: { type: String },
    upvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    upvotesCount: { type: Number, default: 0 },
    downvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    downvotesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.statics.createPost = async function (data: Partial<IPost>) {
  return await new this(data).save();
};

// PostSchema.statics.findSelectedAndPopulatedPosts = async function (filter: any) {
//   return await this.find(filter)
//     .select("-upvotes -downvotes")
//     .populate("user", "username email profilePict")
//     .populate("tags", "name");
// };

const Post = mongoose.model<PostDocument, IPostModel>("Post", PostSchema);

export default Post;

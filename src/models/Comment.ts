import mongoose from "mongoose";
import { CommentDocument, ICommentModel, TCreateComment } from "../types/Comment";

const CommentSchema = new mongoose.Schema<CommentDocument>(
  {
    parentId: { type: mongoose.SchemaTypes.ObjectId, ref: "Comment" },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    postId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
      required: [true, "postId is required"],
    },
    content: { type: String, required: [true, "content is required"] },
    image: { type: String },
    upvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    downvotes: { type: [mongoose.SchemaTypes.ObjectId], ref: "User", default: [] },
    repliesCounts: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.statics.createComment = async function (data: TCreateComment) {
  return await new this(data).save();
};

const Comment = mongoose.model<CommentDocument, ICommentModel>("Comment", CommentSchema);

export default Comment;

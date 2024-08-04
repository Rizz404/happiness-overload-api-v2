import mongoose from "mongoose";
import {
  CommentDocument,
  CommentModel,
  CommentQueryHelpers,
  TCreateComment,
} from "../types/models/Comment";

const CommentSchema = new mongoose.Schema<
  CommentDocument,
  CommentModel,
  {},
  CommentQueryHelpers
>(
  {
    reply: { type: mongoose.SchemaTypes.ObjectId, ref: "Comment" },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    post: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Post",
      required: [true, "postId is required"],
    },
    content: { type: String, required: [true, "content is required"] },
    image: { type: String },
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
    replies: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Comment",
      default: [],
    },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const sensitiveFields = ["-upvotes", "-downvotes", "-replies"];

// @ts-ignore
CommentSchema.query.excludeSensitive = function (
  this: mongoose.Query<any, any>
) {
  return this.select(sensitiveFields.join(" "));
};

CommentSchema.statics.createComment = async function (data: TCreateComment) {
  return await new this(data).save();
};

CommentSchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});

CommentSchema.virtual("downvoteCount").get(function () {
  return this.downvotes.length;
});

CommentSchema.virtual("replyCount").get(function () {
  return this.replies.length;
});

const Comment = mongoose.model<CommentDocument, CommentModel>(
  "Comment",
  CommentSchema
);

export default Comment;

import mongoose from "mongoose";

export interface CommentParams {
  parentId?: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
}

import mongoose from "mongoose";

export interface IComment {
  reply?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDocument extends IComment, mongoose.Document {}

export type TCreateComment = Pick<IComment, "user" | "post" | "content"> &
  Partial<Pick<IComment, "reply" | "image">>;

export interface ICommentModel extends mongoose.Model<CommentDocument> {
  createComment: (data: TCreateComment) => Promise<CommentDocument>;
}

export interface CommentParams {
  reply?: mongoose.Types.ObjectId;
  post?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
}

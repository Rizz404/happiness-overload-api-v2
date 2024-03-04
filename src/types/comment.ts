import mongoose from "mongoose";

export interface IComment {
  parentId?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  image?: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  repliesCounts: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDocument extends IComment, mongoose.Document {}

export type TCreateComment = Pick<IComment, "user" | "postId" | "content"> &
  Partial<Pick<IComment, "parentId" | "image">>;

export interface ICommentModel extends mongoose.Model<CommentDocument> {
  createComment: (data: TCreateComment) => Promise<CommentDocument>;
}

export interface CommentParams {
  parentId?: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
}

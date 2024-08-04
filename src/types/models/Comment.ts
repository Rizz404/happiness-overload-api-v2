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

export interface CommentQueryHelpers {
  excludeSensitive(): mongoose.Query<any, CommentDocument> &
    CommentQueryHelpers;
}

export interface CommentModel
  extends mongoose.Model<CommentDocument, CommentQueryHelpers> {
  createComment: (data: TCreateComment) => Promise<CommentDocument>;
}

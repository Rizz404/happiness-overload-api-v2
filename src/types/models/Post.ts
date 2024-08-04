import mongoose from "mongoose";

export interface IPost {
  user: mongoose.Types.ObjectId; // * Populated makanya namanya user bukan userId
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  images?: string[];
  description?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  cheers: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends IPost, mongoose.Document {}

export type TCreatePost = Pick<IPost, "user" | "title" | "interest" | "tags"> &
  Partial<Pick<IPost, "images" | "description">>;

export interface PostQueryHelpers {
  excludeSensitive(): mongoose.Query<any, PostDocument> & PostQueryHelpers;
}

export interface PostModel
  extends mongoose.Model<PostDocument, PostQueryHelpers> {
  createPost: (data: TCreatePost) => Promise<PostDocument>;
}

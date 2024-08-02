import mongoose from "mongoose";

export interface IPost {
  user: mongoose.Types.ObjectId; // * Populated makanya namanya user bukan userId
  title: string;
  interest: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  isForum: boolean;
  images?: string[];
  description?: string;
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  cheers: mongoose.Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends IPost, mongoose.Document {}

export type TCreatePost = Pick<IPost, "user" | "title" | "interest" | "tags" | "isForum"> &
  Partial<Pick<IPost, "images" | "description">>;

export interface IPostModel extends mongoose.Model<PostDocument> {
  createPost: (data: TCreatePost) => Promise<PostDocument>;
}

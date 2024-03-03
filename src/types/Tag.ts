import mongoose from "mongoose";

export interface ITag {
  name: string;
  interest?: mongoose.Types.ObjectId;
  posts: mongoose.Types.ObjectId[];
  description?: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagDocument extends ITag, mongoose.Document {}

export type TCreateTag = Pick<ITag, "name"> & Partial<Pick<ITag, "interest" | "description">>;

export interface ITagModel extends mongoose.Model<TagDocument> {
  createTag: (data: TCreateTag) => Promise<TagDocument>;
}

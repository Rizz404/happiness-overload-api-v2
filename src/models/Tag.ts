import mongoose from "mongoose";

interface ITag {
  name: string;
  interest?: mongoose.Types.ObjectId;
  posts: mongoose.Types.ObjectId[];
  description?: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagDocument extends ITag, mongoose.Document {}

export interface ITagModel extends mongoose.Model<TagDocument> {
  createTag: (data: Partial<ITag>) => Promise<TagDocument>;
}

const TagSchema = new mongoose.Schema<TagDocument>(
  {
    name: { type: String, unique: true, index: true, required: [true, "tag name is required"] },
    interest: { type: mongoose.SchemaTypes.ObjectId, ref: "Interest" },
    posts: { type: [mongoose.SchemaTypes.ObjectId], ref: "Post", default: [] },
    description: { type: String },
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TagSchema.statics.createTag = async function (data: Partial<ITag>) {
  return await new this(data).save();
};

const Tag = mongoose.model<TagDocument, ITagModel>("Tag", TagSchema);

export default Tag;

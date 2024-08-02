import mongoose from "mongoose";
import { ITagModel, TCreateTag, TagDocument } from "../types/models/Tag";

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

TagSchema.statics.createTag = async function (data: TCreateTag) {
  return await new this(data).save();
};

const Tag = mongoose.model<TagDocument, ITagModel>("Tag", TagSchema);

export default Tag;

import mongoose from "mongoose";
import { ITagModel, TCreateTag, TagDocument } from "../types/models/Tag";

const TagSchema = new mongoose.Schema<TagDocument>(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: [true, "tag name is required"],
    },
    interest: { type: mongoose.SchemaTypes.ObjectId, ref: "Interest" },
    posts: { type: [mongoose.SchemaTypes.ObjectId], ref: "Post", default: [] },
    description: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TagSchema.virtual("postCount").get(function () {
  return this.posts.length;
});

TagSchema.statics.createTag = async function (data: TCreateTag) {
  return await new this(data).save();
};

const Tag = mongoose.model<TagDocument, ITagModel>("Tag", TagSchema);

export default Tag;

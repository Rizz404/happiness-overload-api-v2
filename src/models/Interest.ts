import mongoose from "mongoose";
import {
  IInterestModel,
  InterestDocument,
  TCreateInterest,
} from "../types/models/Interest";

const InterestSchema = new mongoose.Schema<InterestDocument>(
  {
    name: { type: String, unique: true, index: true, required: true },
    image: { type: String },
    description: { type: String },
    tags: { type: [mongoose.Types.ObjectId], ref: "Tag" },
    posts: { type: [mongoose.Types.ObjectId], ref: "Post" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

InterestSchema.virtual("tagCount").get(function () {
  return Array.isArray(this.tags) ? this.tags.length : 0;
});

InterestSchema.virtual("postCount").get(function () {
  return Array.isArray(this.posts) ? this.posts.length : 0;
});

InterestSchema.statics.createInterest = async function (data: TCreateInterest) {
  return await new this(data).save();
};

const Interest = mongoose.model<InterestDocument, IInterestModel>(
  "Interest",
  InterestSchema
);

export default Interest;

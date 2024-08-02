import mongoose from "mongoose";
import { IInterestModel, InterestDocument, TCreateInterest } from "../types/models/Interest";

const InterestSchema = new mongoose.Schema<InterestDocument>(
  {
    name: { type: String, unique: true, index: true, required: true },
    image: { type: String },
    description: { type: String },
    tagsCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InterestSchema.statics.createInterest = async function (data: TCreateInterest) {
  return await new this(data).save();
};

const Interest = mongoose.model<InterestDocument, IInterestModel>("Interest", InterestSchema);

export default Interest;

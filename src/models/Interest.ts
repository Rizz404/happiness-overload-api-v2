import mongoose from "mongoose";

interface IInterest {
  name: string;
  image: string;
  description?: string;
  tagsCount: number;
  postsCount: number;
}

export interface InterestDocument extends IInterest, mongoose.Document {}

export interface IInterestModel extends mongoose.Model<InterestDocument> {
  createInterest: (data: Partial<IInterest>) => Promise<InterestDocument>;
}

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

InterestSchema.statics.createInterest = async function (data: Partial<IInterest>) {
  return await new this(data).save();
};

const Interest = mongoose.model<InterestDocument, IInterestModel>("Interest", InterestSchema);

export default Interest;

import mongoose from "mongoose";

interface IInterest {
  name: String;
  tag: mongoose.Types.ObjectId[];
  image: String;
  description?: String;
  tagsCount: number;
}

export interface InterestDocument extends IInterest, mongoose.Document {}

const InterestSchema = new mongoose.Schema<InterestDocument>(
  {
    name: { type: String, unique: true, index: true, required: true },
    tag: { type: [mongoose.SchemaTypes.ObjectId], ref: "Tag", default: [] },
    image: { type: String },
    description: { type: String },
    tagsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<InterestDocument>("Interest", InterestSchema);

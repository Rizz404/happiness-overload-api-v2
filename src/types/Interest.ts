import mongoose from "mongoose";

export interface IInterest {
  name: string;
  image?: string;
  description?: string;
  tagsCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterestDocument extends IInterest, mongoose.Document {}

export type TCreateInterest = Pick<IInterest, "name"> &
  Partial<Pick<IInterest, "description" | "image">>;

export interface IInterestModel extends mongoose.Model<InterestDocument> {
  createInterest: (data: TCreateInterest) => Promise<InterestDocument>;
}

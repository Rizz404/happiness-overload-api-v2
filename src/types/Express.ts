import mongoose from "mongoose";

export interface ReqUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: "Admin" | "User" | "Bot";
}

declare global {
  namespace Express {
    interface Request {
      user: ReqUser;
    }
  }
}

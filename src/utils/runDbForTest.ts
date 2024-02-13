import mongoose from "mongoose";
import connectDb from "../config/dbConfig";

beforeAll(async () => {
  await connectDb();
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }
});

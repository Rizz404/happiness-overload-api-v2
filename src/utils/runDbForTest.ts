import connectDb from "../config/dbConfig";

beforeAll(async () => {
  await connectDb();
});

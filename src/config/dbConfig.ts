import mongoose from "mongoose";
import getErrorMessage from "../utils/express/getErrorMessage";

const connectDb = async () => {
  try {
    const NODE_ENV = process.env.NODE_ENV;
    const DB_URI = process.env.DB_URI;
    const DB_URI_LOCAL = process.env.DB_URI_LOCAL;

    if (!NODE_ENV) {
      console.error("Error: NODE_ENV environment variable is not set");
      process.exit(1);
    } else if (!DB_URI) {
      console.error("Error: DB_URI environment variable is not set");
      process.exit(1);
    } else if (!DB_URI_LOCAL) {
      console.error("Error: DB_URI_LOCAL environment variable is not set");
      process.exit(1);
    }

    const dbUriToUse = NODE_ENV === "development" || NODE_ENV === "testing" ? DB_URI_LOCAL : DB_URI;
    const dbName = dbUriToUse.split("/").pop();

    await mongoose.connect(dbUriToUse);
    NODE_ENV !== "testing" && console.log(`Connected to db ${dbName}`);
  } catch (error) {
    getErrorMessage(error);
    process.exit(1);
  }
};

export default connectDb;

import mongoose from "mongoose";
import getErrorMessage from "../utils/getErrorMessage";

const connectDb = async () => {
  try {
    const PROJECT_STATUS = process.env.PROJECT_STATUS;
    const DB_URI = process.env.DB_URI;
    const DB_URI_LOCAL = process.env.DB_URI_LOCAL;

    if (!PROJECT_STATUS) {
      console.error("Error: PROJECT_STATUS environment variable is not set");
      process.exit(1);
    } else if (!DB_URI) {
      console.error("Error: DB_URI environment variable is not set");
      process.exit(1);
    } else if (!DB_URI_LOCAL) {
      console.error("Error: DB_URI_LOCAL environment variable is not set");
      process.exit(1);
    }

    const dbUriToUse =
      PROJECT_STATUS === "development" || PROJECT_STATUS === "testing" ? DB_URI_LOCAL : DB_URI;
    const dbName = dbUriToUse.split("/").pop();

    await mongoose.connect(dbUriToUse);
    PROJECT_STATUS !== "testing" && console.log(`Connected to db ${dbName}`);
  } catch (error) {
    getErrorMessage(error);
    process.exit(1);
  }
};

export default connectDb;

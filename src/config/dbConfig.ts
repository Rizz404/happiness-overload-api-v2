import mongoose from "mongoose";
import getErrorMessage from "../utils/express/getErrorMessage";

const connectDb = async () => {
  try {
    const PROJECT_STATUS = process.env.PROJECT_STATUS;
    const DB_URI = process.env.DB_URI;
    const DB_NAME = DB_URI?.split("/").pop();

    if (!PROJECT_STATUS) {
      console.error("Error: DB_URI environment variable is not set");
      return process.exit(1);
    }

    if (!DB_URI) {
      console.error("Error: PROJECT_STATUS environment variable is not set");
      return process.exit(1);
    }

    await mongoose.connect(DB_URI);

    if (PROJECT_STATUS !== "testing") {
      console.log(`Connected to db ${DB_NAME}`);
    }
  } catch (error) {
    getErrorMessage(error);
    process.exit(1);
  }
};

export default connectDb;

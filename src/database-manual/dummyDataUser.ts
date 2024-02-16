import mongoose from "mongoose";
import connectDb from "../config/dbConfig";
import User from "../models/User";
import { emailFromRandomName, randomName } from "../utils/somethingRandom";
import "dotenv/config";

async function insertManyDummyUser() {
  try {
    await connectDb();

    const users = await User.insertMany([
      {
        username: randomName(),
        email: emailFromRandomName(),
        password: "dummy-password",
        isOauth: false,
        roles: "Bot",
      },
      {
        username: randomName(),
        email: emailFromRandomName(),
        password: "dummy-password",
        isOauth: false,
        roles: "Bot",
      },
      {
        username: randomName(),
        email: emailFromRandomName(),
        password: "dummy-password",
        isOauth: false,
        roles: "Bot",
      },
      {
        username: randomName(),
        email: emailFromRandomName(),
        password: "dummy-password",
        isOauth: false,
        roles: "Bot",
      },
      {
        username: randomName(),
        email: emailFromRandomName(),
        password: "dummy-password",
        isOauth: false,
        roles: "Bot",
      },
    ]);

    console.log(users);
  } catch (error) {
    console.error(error);
  }
}

insertManyDummyUser().then(async () =>
  mongoose.connection.readyState
    ? await mongoose.connection.close()
    : console.log("Already close miaw")
);

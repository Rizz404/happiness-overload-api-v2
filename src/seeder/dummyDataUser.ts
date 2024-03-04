import mongoose from "mongoose";
import connectDb from "../config/dbConfig";
import User from "../models/User";
import { emailFromRandomName, randomName } from "../utils/helpers/somethingRandom";
import bcrypt from "bcrypt";
import "dotenv/config";

async function stupidPassword() {
  const password = "dummy-password";
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

async function createDummyUser() {
  return {
    username: randomName(),
    email: emailFromRandomName(),
    password: await stupidPassword(),
    isOauth: false,
    roles: "Bot",
  };
}

async function insertManyDummyUser() {
  try {
    await connectDb();

    const dummyUsersPromises = Array(5).fill(null).map(createDummyUser);
    const dummyUsers = await Promise.all(dummyUsersPromises);

    const users = await User.insertMany(dummyUsers);

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

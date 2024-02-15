import mongoose from "mongoose";
import connectDb from "../config/dbConfig";
import request from "supertest";
import app from "..";
import { emailFromRandomName, randomName } from "./somethingRandom";

// * Fungsi untuk menghasilkan string acak

let jwt: string;

export const user = {
  username: randomName(),
  email: emailFromRandomName(),
  password: "dummy-password",
};

export const setup = async () => {
  await connectDb();

  const response = await request(app)
    .post("/auth/login")
    .send({ username: user.username, password: user.password });

  jwt = response.headers["set-cookie"]; // * Ambil jwt dari headers
};

export const teardown = async () => {
  if (mongoose.connection.readyState) {
    await request(app).post("/auth/logout");
    await mongoose.connection.close();
  }
};

export const getJwt = () => jwt;

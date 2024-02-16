import mongoose from "mongoose";
import connectDb from "../config/dbConfig";
import request from "supertest";
import app from "..";

// * Fungsi untuk menghasilkan string acak

let jwt: string;

export const setup = async () => {
  await connectDb();

  const getUserRandom = await request(app).get("/tests/users/random-user");
  const response = await request(app)
    .post("/auth/login")
    .send({ username: getUserRandom.body.username, password: "dummy-password" });

  jwt = response.headers["set-cookie"]; // * Ambil jwt dari headers
};

export const teardown = async () => {
  if (mongoose.connection.readyState) {
    await request(app).post("/auth/logout");
    await mongoose.connection.close();
  }
};

export const getJwt = () => jwt;

import mongoose from "mongoose";
import connectDb from "../config/dbConfig";
import request from "supertest";
import app from "..";

// * Fungsi untuk menghasilkan string acak
const randomString = () => Math.random().toString(36).substring(7);
export const user = {
  username: `dummy-user-${randomString()}`,
  email: `dummy-user-${randomString()}@gmail.com`,
  password: "dummy-password",
};

export const setup = async () => {
  await connectDb();
};

export const teardown = async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }
};

export const createAndAuthUser = async () => {
  // * Buat dummy user
  await request(app).post("/auth/register").send(user);

  const response = await request(app)
    .post("/auth/login")
    .send({ username: user.username, password: user.password });

  return response.headers["set-cookie"]; // * Ambil jwt dari headers
};

export const logoutUser = async () => {
  await request(app).post("/auth/logout");
};

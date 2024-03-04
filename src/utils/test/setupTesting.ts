import mongoose from "mongoose";
import connectDb from "../../config/dbConfig";
import request from "supertest";
import app from "../..";
import getErrorMessage from "../express/getErrorMessage";

// * Fungsi untuk menghasilkan string acak

let jwt: string;
let user: {
  _id: string;
  username: string;
  email: string;
  roles: string;
  isOauth: boolean;
};

export const setup = async () => {
  try {
    await connectDb();

    const getUserRandom = await request(app).get("/tests/users/random-user");
    const response = await request(app)
      .post("/auth/login")
      .send({ username: getUserRandom.body.username, password: "dummy-password" });

    if (response.statusCode !== 200) {
      throw new Error("Something wrong");
    }

    jwt = response.headers["set-cookie"]; // * Ambil jwt dari headers
    user = {
      _id: response.body._id,
      username: response.body.username,
      email: response.body.email,
      roles: response.body.roles,
      isOauth: response.body.isOauth,
    };
  } catch (error) {
    getErrorMessage(error);
  }
};

export const teardown = async () => {
  if (mongoose.connection.readyState) {
    await request(app).post("/auth/logout");
    await mongoose.connection.close();
  }
};

export { jwt, user };

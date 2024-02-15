import request from "supertest";
import app from "..";
import { setup, teardown } from "../utils/setupTesting";
import { emailFromRandomName, randomName } from "../utils/somethingRandom";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

const user = {
  username: randomName(),
  email: emailFromRandomName(),
  password: "dummy-password",
};

describe("Auth Routes", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/auth/register").send(user);

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty("message", `User ${user.username} has been created`);
    });
  });

  describe("POST /auth/login", () => {
    it("should login user and return user data", async () => {
      const response = await request(app).post("/auth/login").send({
        email: user.email,
        password: user.password,
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("username", user.username);
      expect(response.body).toHaveProperty("email", user.email);
      expect(response.body).toHaveProperty("roles", "User");
      expect(response.body).toHaveProperty("isOauth", false);
      expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout user and remove token from cookie", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.statusCode).toEqual(204);
    });
  });
});

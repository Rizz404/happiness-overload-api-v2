import request from "supertest";
import app from "..";
import { user, setup, teardown, createAndAuthUser, logoutUser } from "../utils/setupTesting";

let jwt: string;

beforeAll(async () => {
  await setup();
  jwt = await createAndAuthUser();
});

afterAll(async () => {
  await logoutUser();
  await teardown();
});

describe("User Routes", () => {
  describe("GET /users/profile", () => {
    it("should get user that log-in", async () => {
      const response = await request(app).get("/users/profile").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("username", user.username);
      expect(response.body).toHaveProperty("email", user.email);
      expect(response.body).toHaveProperty("roles", "User");
      expect(response.body).toHaveProperty("isOauth", false);

      // * Cek properti adalah sama dengan Date
      expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
      expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
    });
  });
});

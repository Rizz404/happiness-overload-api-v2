import request from "supertest";
import app from "..";
import { getJwt, setup, teardown } from "../utils/setupTesting";

let jwt: string;

beforeAll(async () => {
  await setup();
  jwt = getJwt();
});

afterAll(async () => {
  await teardown();
});

describe("Comment Routes", () => {
  describe("GET /comments/", () => {
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/comments/post/65b7869ec9afa3404df6cc8d");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
  });
});

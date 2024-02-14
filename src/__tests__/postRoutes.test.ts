import request from "supertest";
import app from "..";
import { createAndAuthUser, logoutUser, setup, teardown } from "../utils/setupTesting";

let jwt: string;

beforeAll(async () => {
  await setup();
  jwt = await createAndAuthUser();
});

afterAll(async () => {
  await logoutUser();
  await teardown();
});

describe("Post Routes", () => {
  describe("GET /posts/", () => {
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts?category=home");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts?category=top");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts?category=trending");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts?category=fresh");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts?category=user&userId=65b3c60de4f773c700ff1633");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("category");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
  });

  // describe("POST /posts/", () => {
  //   const postsBody = {
  //     title: "test",
  //     tags: ["65b735344e94e4f9556500af"],
  //     description: "test",
  //     images: [""],
  //   };

  //   it("Should create some posts", async () => {
  //     const res = await request(app).post("/posts/").send(postsBody);
  //     const { statusCode, body } = res;

  //     expect(statusCode).toEqual(200);
  //     expect(body).toHaveProperty("_id");
  //     expect(body).toHaveProperty("title");
  //     expect(body).toHaveProperty("tags");
  //     expect(body).toHaveProperty("description");
  //     expect(body).toHaveProperty("images");
  //     expect(body).toHaveProperty("upvotes");
  //     expect(body).toHaveProperty("downvotes");
  //     expect(body).toHaveProperty("commentsCount");
  //   });
  // });
});

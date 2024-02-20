import request from "supertest";
import app from "..";
import { setup, teardown, user, jwt } from "../utils/setupTesting";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe("Post Routes", () => {
  describe("GET /posts/", () => {
    it("Should return arrray of posts", async () => {
      const response = await request(app).get("/posts");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const response = await request(app).get("/posts?category=home");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const response = await request(app).get("/posts?category=top");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const response = await request(app).get("/posts?category=trending");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const response = await request(app).get("/posts?category=fresponseh");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
    });
    it("Should return arrray of posts", async () => {
      const response = await request(app).get(
        "/posts?category=user&userId=65b3c60de4f773c700ff1633"
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body).toHaveProperty("links");
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
  //     const response = await request(app).post("/posts/").send(postsBody);
  //     const { response.statusCode, response.body } = response;

  //     expect(response.statusCode).toEqual(200);
  //     expect(response.body).toHaveProperty("_id");
  //     expect(response.body).toHaveProperty("title");
  //     expect(response.body).toHaveProperty("tags");
  //     expect(response.body).toHaveProperty("description");
  //     expect(response.body).toHaveProperty("images");
  //     expect(response.body).toHaveProperty("upvotes");
  //     expect(response.body).toHaveProperty("downvotes");
  //     expect(response.body).toHaveProperty("commentsCount");
  //   });
  // });
});

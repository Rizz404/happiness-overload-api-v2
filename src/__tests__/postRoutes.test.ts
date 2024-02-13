import request from "supertest";
import app from "..";

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
});

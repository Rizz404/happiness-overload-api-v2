import request from "supertest";
import app from "..";

describe("Comment Routes", () => {
  describe("GET /comments/", () => {
    it("Should return arrray of posts", async () => {
      const res = await request(app).get("/posts");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
  });
});

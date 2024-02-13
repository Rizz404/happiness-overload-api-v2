import request from "supertest";
import app from "..";

describe("User Routes", () => {
  let cookies: string;

  beforeAll(async () => {
    // * Login dan dapatkan cookies
    const res = await request(app).post("/auth/login").send({
      email: "rizzthenotable@gmail.com",
      password: "177013",
    });

    cookies = res.headers["set-cookie"]; // * Ambil cookies dari headers
  });

  describe("GET /users/profile", () => {
    it("should register a new user", async () => {
      const res = await request(app).get("/users/profile").set("Cookie", cookies); // * Maksudnya jwt ya
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("_id");
      expect(body).toHaveProperty("username");
      expect(body).toHaveProperty("email");
      expect(body).toHaveProperty("roles");
      expect(body).toHaveProperty("isOauth");
      expect(body).toHaveProperty("lastLogin");
      expect(body).toHaveProperty("createdAt");
      expect(body).toHaveProperty("updatedAt");
    });
  });
});

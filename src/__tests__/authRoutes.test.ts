import request from "supertest";
import app from "..";

const registerBody = { username: "test", email: "test@email.com", password: "177013" };

describe("Auth Routes", () => {
  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send(registerBody);
      const { statusCode, body } = res;

      expect(statusCode).toEqual(201);
      expect(body).toHaveProperty("message", `User ${registerBody.username} has been created`);
    });
  });

  describe("POST /auth/login", () => {
    it("should login user and return user data", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "rizzthenotable@gmail.com",
        password: "177013",
      });
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("_id");
      expect(body).toHaveProperty("username");
      expect(body).toHaveProperty("email");
      expect(body).toHaveProperty("roles");
      expect(body).toHaveProperty("isOauth");
      expect(body).toHaveProperty("lastLogin");
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout user and remove token from cookie", async () => {
      const res = await request(app).post("/auth/logout");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(204);
    });
  });

  describe("DELETE /tests/users/:username", () => {
    it("should delete user for testing purpose", async () => {
      const res = await request(app).delete(`/tests/users/${registerBody.username}`);
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty(
        "message",
        `Successfully deleted user with username ${registerBody.username}`
      );
    });
  });
});

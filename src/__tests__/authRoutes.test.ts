import request from "supertest";
import app from "..";

describe("Auth Routes", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "testuser",
      email: "testemail",
      password: "testpassword",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("username");
  });

  // Add more tests as needed
});

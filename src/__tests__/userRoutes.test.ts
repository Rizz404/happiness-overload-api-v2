import request from "supertest";
import app from "..";
import { user, setup, teardown, jwt } from "../utils/setupTesting";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe("User Routes", () => {
  describe("GET /users/profile", () => {
    it("should get user that log-in", async () => {
      const response = await request(app).get("/users/profile").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
        })
      );

      expect(response.body).toHaveProperty("_id", user._id);
      expect(response.body).toHaveProperty("username", user.username);
      expect(response.body).toHaveProperty("email", user.email);
      expect(response.body).toHaveProperty("roles", user.roles);
      expect(response.body).toHaveProperty("isOauth", user.isOauth);

      // * Cek properti adalah sama dengan Date
      expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
      expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
    });
  });

  describe("PATCH /users/profile", () => {
    it("should update user and return data after update", async () => {
      const response = await request(app)
        .patch("/users/profile")
        .send({ fullname: `fullname-${user.username}` })
        .set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body).toHaveProperty("username", user.username);
      expect(response.body).toHaveProperty("email", user.email);
      expect(response.body).toHaveProperty("roles", user.roles);
      expect(response.body).toHaveProperty("isOauth", false);
      expect(response.body).toHaveProperty("fullname", `fullname-${user.username}`);

      // * Cek properti adalah sama dengan Date
      expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
      expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
    });
  });

  describe("GET users/following", () => {
    it("should return user that current user following", async () => {
      const response = await request(app).get("/users/following").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data > 0) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(String),
              username: expect.any(String),
              email: expect.any(String),
              password: expect.any(String),
              roles: expect.any(String),
              fullname: expect.any(String),
              profilePict: expect.any(String),
              phoneNumber: expect.any(Number),
              isOauth: expect.any(Boolean),
              bio: expect.any(String),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            }),
          ])
        );
      }
      expect(response.body.pagination).toEqual(
        expect.objectContaining({
          currentPage: expect.any(Number),
          dataPerPage: expect.any(Number),
          totalData: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
        })
      );
      expect(response.body.links).toEqual(
        expect.objectContaining({
          previous: null,
          next: null,
        })
      );
    });
  });

  describe("GET users/followers", () => {
    it("should return user followers", async () => {
      const response = await request(app).get("/users/followers").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data > 0) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(String),
              username: expect.any(String),
              email: expect.any(String),
              password: expect.any(String),
              roles: expect.any(String),
              fullname: expect.any(String),
              profilePict: expect.any(String),
              phoneNumber: expect.any(Number),
              isOauth: expect.any(Boolean),
              bio: expect.any(String),
              createdAt: expect.any(Date),
              updatedAt: expect.any(Date),
            }),
          ])
        );
      }
      expect(response.body.pagination).toEqual(
        expect.objectContaining({
          currentPage: expect.any(Number),
          dataPerPage: expect.any(Number),
          totalData: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
        })
      );
      expect(response.body.links).toEqual(
        expect.objectContaining({
          previous: null,
          next: null,
        })
      );
    });
  });

  describe("GET users/search by username", () => {
    it("should return user that current user looking for", async () => {
      const response = await request(app).get(
        `/users/search?username=${user.username.substring(7)}`
      );

      expect(response.statusCode).toEqual(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            username: expect.stringContaining(user.username),
          }),
        ])
      );
    });
  });

  describe("GET users/search by email", () => {
    it("should return user that current user looking for", async () => {
      const response = await request(app).get(`/users/search?email=${user.email}`);

      expect(response.statusCode).toEqual(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            email: expect.stringContaining(user.email),
          }),
        ])
      );
    });
  });
});

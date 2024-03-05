import request from "supertest";
import app from "../..";
import { user, setup, teardown, jwt } from "../../utils/setupTesting";
import { expectedUser, expectedDate, expectedPagination, expectedLinks } from "../expectedValue";

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
      expect(response.body).toEqual(expect.objectContaining(expectedUser(response, user)));
      expectedDate(response);
    });
  });

  describe("PATCH /users/profile", () => {
    it("should update user and return data after update", async () => {
      const response = await request(app)
        .patch("/users/profile")
        .send({ fullname: `fullname-${user.username}` })
        .set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expect.objectContaining(expectedUser(response, user)));
      expectedDate(response);
    });
  });

  describe("GET users/following", () => {
    it("should return user that current user following", async () => {
      const response = await request(app).get("/users/following").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([expect.objectContaining(expectedUser(response, user))])
        );
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
  });

  describe("GET users/followers", () => {
    it("should return user followers", async () => {
      const response = await request(app).get("/users/followers").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data > 0) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([expect.objectContaining(expectedUser(response, user))])
        );
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
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

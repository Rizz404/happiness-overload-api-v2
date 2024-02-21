import request, { Response } from "supertest";
import app from "..";
import { user, setup, teardown, jwt } from "../utils/setupTesting";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

const expectedUser = (response: Response) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    roles: user.roles,
    ...(response.body.fullname && { fullname: expect.any(String) }),
    isOauth: user.isOauth,
    lastLogin: expect.anything(),
    ...(response.body.profilePict && { profilePict: expect.any(String) }),
    ...(response.body.phoneNumber && { phoneNumber: expect.any(Number) }),
    createdAt: expect.anything(),
    updatedAt: expect.anything(),
  };
};

const expectedDate = (response: Response) => {
  expect(new Date(response.body.lastLogin)).toBeInstanceOf(Date);
  expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
  expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
};

const expectedPagination = () => {
  return {
    currentPage: expect.any(Number),
    dataPerPage: expect.any(Number),
    totalData: expect.any(Number),
    totalPages: expect.any(Number),
    hasNextPage: expect.any(Boolean),
  };
};

const expectedLinks = () => {
  return {
    previous: null,
    next: null,
  };
};

describe("User Routes", () => {
  describe("GET /users/profile", () => {
    it("should get user that log-in", async () => {
      const response = await request(app).get("/users/profile").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(expect.objectContaining(expectedUser(response)));
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
      expect(response.body).toEqual(expect.objectContaining(expectedUser(response)));
      expectedDate(response);
    });
  });

  describe("GET users/following", () => {
    it("should return user that current user following", async () => {
      const response = await request(app).get("/users/following").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data > 0) {
        expect(response.body.data).toEqual(
          expect.arrayContaining([expect.objectContaining(expectedUser(response))])
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
          expect.arrayContaining([expect.objectContaining(expectedUser(response))])
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

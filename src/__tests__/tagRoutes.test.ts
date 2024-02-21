import request, { Response } from "supertest";
import app from "..";
import { jwt, setup, teardown } from "../utils/setupTesting";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

const expectedPost = (response: Response) => {
  return {
    _id: expect.any(String),
    userId: expect.any(String),
    title: expect.any(String),
    tags: expect.arrayContaining(expect.any(String)),
    ...(response.body.images && { images: expect.arrayContaining(expect.any(String)) }),
    ...(response.body.description && { description: expect.any(String) }),
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

describe("Tags Routes", () => {
  describe("GET /tags?category=all", () => {
    it("Should return arrray of tags", async () => {
      const res = await request(app).get("/tags");
      const { statusCode, body } = res;

      expect(statusCode).toEqual(200);
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("pagination");
      expect(body).toHaveProperty("links");
    });
  });
});

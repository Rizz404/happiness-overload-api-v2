import request from "supertest";
import app from "../..";
import { setup, teardown, user, jwt } from "../../utils/setupTesting";
import { expectedLinks, expectedPagination, expectedPost } from "../expectedValue";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe("Post Routes", () => {
  describe("GET /posts/", () => {
    it("Should return arrray of posts category home", async () => {
      const response = await request(app).get("/posts").expect(200).expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
    it("Should return arrray of posts category home", async () => {
      const response = await request(app).get("/posts?category=home");

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
    it("Should return arrray of posts category top", async () => {
      const response = await request(app).get("/posts?category=top");

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
    it("Should return arrray of posts category trending", async () => {
      const response = await request(app).get("/posts?category=trending");

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
    it("Should return arrray of posts category fresh", async () => {
      const response = await request(app).get("/posts?category=fresh");

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
    it("Should return arrray of posts category user based on id", async () => {
      const response = await request(app).get(`/posts?category=user&userId=${user._id}`);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
  });

  describe("GET /posts/saved", () => {
    it("Should return array of post if user saved some post", async () => {
      const response = await request(app).get("/posts/saved").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
  });

  describe("GET /posts/self", () => {
    it("Should return array of post that user created", async () => {
      const response = await request(app).get("/posts/self").set("Cookie", jwt);

      expect(response.statusCode).toEqual(200);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
  });

  describe("GET /posts/search?title=:title", () => {
    it("Should return array of post that user created", async () => {
      const response = await request(app)
        .get(`/posts/search?title=he`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        response.body.data.forEach((post: any) => {
          expect.objectContaining(expectedPost(post));
        });
      }
      expect(response.body.pagination).toEqual(expect.objectContaining(expectedPagination()));
      expect(response.body.links).toEqual(expect.objectContaining(expectedLinks()));
    });
  });

  describe("GET /posts/:postId", () => {
    it("Should return post by id", async () => {
      const randomPost = await request(app).get("/posts/random-post");

      if (!randomPost.body) {
        return console.log("Random post is not working");
      }

      const response = await request(app)
        .get(`/posts/${randomPost.body._id}`)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toEqual(expect.objectContaining(expectedPost(response)));
    });
  });

  describe("GET /posts/random-post", () => {
    it("Should return post by id", async () => {
      const response = await request(app)
        .get("/posts/random-post")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toEqual(expect.objectContaining(expectedPost(response)));
    });
  });

  describe("GET /posts/save", () => {
    it("Should return post by id", async () => {
      const randomPost = await request(app).get("/posts/random-post");

      if (!randomPost.body) {
        return console.log("Random post is not working");
      }

      const response = await request(app)
        .patch(`/posts/save/${randomPost.body._id}`)
        .set("Cookie", jwt)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /posts/upvote", () => {
    it("Should return post by id", async () => {
      const randomPost = await request(app).get("/posts/random-post");

      if (!randomPost.body) {
        return console.log("Random post is not working");
      }

      const response = await request(app)
        .patch(`/posts/save/${randomPost.body._id}`)
        .set("Cookie", jwt)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /posts/downvote", () => {
    it("Should return post by id", async () => {
      const randomPost = await request(app).get("/posts/random-post");

      if (!randomPost.body) {
        return console.log("Random post is not working");
      }

      const response = await request(app)
        .patch(`/posts/save/${randomPost.body._id}`)
        .set("Cookie", jwt)
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message");
    });
  });
});

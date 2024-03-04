import request, { Response } from "supertest";
import app from "../..";
import { jwt, setup, teardown } from "../../utils/setupTesting";
import { expectedTag } from "../expectedValue";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe("Tags Routes", () => {
  describe("POST /tags", () => {
    it("Should created new tag", async () => {
      const response = await request(app)
        .post("/tags")
        .set("Cookie", jwt)
        .send({
          name: "tag for test",
          description: "this is tag for testing",
        })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("message", `Tag ${response.body.name} has been created`);
    });
  });

  describe("GET /tags", () => {
    it("Should return arrray of tags", async () => {
      const response = await request(app).get("/tags").expect(200).expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        response.body.data.foreach((tag: any) => {
          expect.objectContaining(expectedTag(tag));
        });
      }
    });

    it("Should return arrray of tags", async () => {
      const response = await request(app)
        .get("/tags?category=all")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        response.body.data.foreach((tag: any) => {
          expect.objectContaining(expectedTag(tag));
        });
      }
    });

    it("Should return arrray of tags", async () => {
      const response = await request(app)
        .get("/tags?category=featured-tags")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        response.body.data.foreach((tag: any) => {
          expect.objectContaining(expectedTag(tag));
        });
      }
    });
  });
});

import {
  searchTagsByName,
  getTags,
  getPostsByTagName,
  createTag,
  blockTag,
  followTag,
  getTag,
  getRandomTag,
  getRandomTags,
} from "../controllers/tagControllers";
import express from "express";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";

const router = express.Router();

router.route("/").get(getTags).post(verifyJwtAndRoles(), createTag);
router.get("/search", searchTagsByName);
router.get("/random-tag", getRandomTag);
router.get("/random-tags", getRandomTags);
router.patch("/follow/:tagId", verifyJwtAndRoles(), followTag);
router.patch("/block/:tagId", verifyJwtAndRoles(), blockTag);
router.get("/posts/:name", getPostsByTagName);
router.get("/:tagId", getTag);

export default router;

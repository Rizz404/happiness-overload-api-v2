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
import { auth, optionalAuth } from "../middleware/authentication";

const router = express.Router();

// * Prefix /tags
router.route("/").get(getTags).post(auth, createTag);
router.get("/search", searchTagsByName);
router.get("/random-tag", getRandomTag);
router.get("/random-tags", getRandomTags);
router.patch("/follow/:tagId", auth, followTag);
router.patch("/block/:tagId", auth, blockTag);
router.get("/posts/:name", getPostsByTagName);
router.get("/:tagId", getTag);

export default router;

import {
  createPost,
  getPost,
  deletePost,
  searchPostsByTitle,
  getPosts,
  upvotePost,
  downvotePost,
  savePost,
  getSavedPosts,
  getSelfPosts,
  getRandomPost,
} from "../controllers/postControllers";
import express from "express";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";
import { upload, uploadManyToFirebase } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * prefixnya /posts

router.get("/", getPosts);
router.post("/", verifyJwtAndRoles(), upload.array("images", 7), uploadManyToFirebase, createPost);
router.get("/search", searchPostsByTitle);
router.get("/random-post", getRandomPost);
router.get("/saved", verifyJwtAndRoles(), getSavedPosts);
router.get("/self", verifyJwtAndRoles(), getSelfPosts);
router.patch("/save/:postId", verifyJwtAndRoles(), savePost);
router.patch("/upvote/:postId", verifyJwtAndRoles(), upvotePost); // * Undo and redo
router.patch("/downvote/:postId", verifyJwtAndRoles(), downvotePost); // * Undo and redo
router.route("/:postId").get(getPost).delete(verifyJwtAndRoles(), deletePost);

export default router;

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
  cheersPost,
  getUsersCheeredPost,
  getRandomPosts,
} from "../controllers/postControllers";
import express from "express";
import { auth, optionalAuth } from "../middleware/authentication";
import { upload, uploadManyToFirebase } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * Prefix /posts
router
  .route("/")
  .post(auth, upload.array("images", 7), uploadManyToFirebase, createPost)
  .get(optionalAuth, getPosts); // * Bisa menambahkan query page, limit, category, dan userId
router.get("/search", searchPostsByTitle);
router.get("/random-post", getRandomPost);
router.get("/random-posts", getRandomPosts);
router.get("/saved", auth, getSavedPosts); // * Bisa menambahkan query page dan limit
router.get("/self", auth, getSelfPosts); // * Bisa menambahkan query page dan limit
router.patch("/save/:postId", auth, savePost);
router.route("/cheers/:postId").get(getUsersCheeredPost).patch(auth, cheersPost);
router.patch("/upvote/:postId", auth, upvotePost); // * Undo and redo
router.patch("/downvote/:postId", auth, downvotePost); // * Undo and redo
router.route("/:postId").get(getPost).delete(auth, deletePost);

export default router;

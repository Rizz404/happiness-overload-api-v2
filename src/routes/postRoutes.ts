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
} from "../controllers/postControllers";
import express from "express";
import { auth, optionalAuth } from "../middleware/authentication";
import { upload, uploadManyToFirebase } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * prefixnya /posts

router
  .route("/")
  .post(auth, upload.array("images", 7), uploadManyToFirebase, createPost)
  .get(optionalAuth, getPosts);
router.get("/search", searchPostsByTitle);
router.get("/random-post", getRandomPost);
router.get("/saved", auth, getSavedPosts);
router.get("/self", auth, getSelfPosts);
router.patch("/save/:postId", auth, savePost);
router.route("/cheers/:postId").get(getUsersCheeredPost).patch(auth, cheersPost);
router.patch("/upvote/:postId", auth, upvotePost); // * Undo and redo
router.patch("/downvote/:postId", auth, downvotePost); // * Undo and redo
router.route("/:postId").get(getPost).delete(auth, deletePost);

export default router;

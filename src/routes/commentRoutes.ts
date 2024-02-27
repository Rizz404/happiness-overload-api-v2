import express from "express";
import {
  createComment,
  deleteComment,
  getComment,
  getPostComments,
  updateComment,
  getReplies,
  upvoteComment,
  downvoteComment,
  getRandomComment,
} from "../controllers/commentControllers";
import { auth, optionalAuth } from "../middleware/authentication";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

router
  .route("/create/:postId/:parentId?")
  .post(auth, upload.single("image"), uploadToFirebase, createComment);
router.route("/post/:postId").get(getPostComments);
router.get("/replies/:commentId", getReplies);
router.patch("/upvote/:commentId", auth, upvoteComment); // * Undo and redo
router.patch("/downvote/:commentId", auth, downvoteComment); // * Undo and redo
router.get("/random-comment", getRandomComment);
router.route("/:commentId").get(getComment).patch(auth, updateComment).delete(auth, deleteComment);

export default router;

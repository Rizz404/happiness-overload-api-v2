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
  createReply,
} from "../controllers/commentControllers";
import { auth, optionalAuth } from "../middleware/authentication";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

router
  .route("/create/:postId/")
  .post(auth, upload.single("image"), uploadToFirebase, createComment);
router.route("/post/:postId").get(getPostComments);
router
  .route("/replies/:commentId")
  .post(auth, upload.single("image"), uploadToFirebase, createReply)
  .get(getReplies);
router.patch("/upvote/:commentId", auth, upvoteComment); // * Undo and redo
router.patch("/downvote/:commentId", auth, downvoteComment); // * Undo and redo
router.get("/random-comment", getRandomComment);
router
  .route("/:commentId")
  .get(getComment)
  .patch(auth, upload.single("image"), uploadToFirebase, updateComment)
  .delete(auth, deleteComment);

export default router;

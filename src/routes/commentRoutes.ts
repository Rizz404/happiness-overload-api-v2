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
  getRandomComments,
} from "../controllers/commentControllers";
import { auth, optionalAuth } from "../middleware/authentication";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * Prefix /comments
router
  .route("/create/:postId/:?replyId")
  .post(auth, upload.single("image"), uploadToFirebase, createComment);
router.route("/post/:postId").get(getPostComments); // * Bisa menambahkan query page dan limit
router.route("/replies/:commentId").get(getReplies); // * Bisa menambahkan query page dan limit
router.patch("/upvote/:commentId", auth, upvoteComment); // * Undo and redo
router.patch("/downvote/:commentId", auth, downvoteComment); // * Undo and redo
router.get("/random-comment", getRandomComment);
router.get("/random-comments", getRandomComments);
router
  .route("/:commentId")
  .get(getComment)
  .patch(auth, upload.single("image"), uploadToFirebase, updateComment)
  .delete(auth, deleteComment);

export default router;

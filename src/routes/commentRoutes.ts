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
} from "../controllers/commentControllers";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

router
  .route("/create/:postId/:parentId?")
  .post(verifyJwtAndRoles(), upload.single("image"), uploadToFirebase, createComment);
router.route("/post/:postId").get(getPostComments);
router.get("/replies/:commentId", getReplies);
router.patch("/upvote/:commentId", verifyJwtAndRoles(), upvoteComment); // * Undo and redo
router.patch("/downvote/:commentId", verifyJwtAndRoles(), downvoteComment); // * Undo and redo
router
  .route("/:commentId")
  .get(getComment)
  .patch(verifyJwtAndRoles(), updateComment)
  .delete(verifyJwtAndRoles(), deleteComment);

export default router;

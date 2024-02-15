import express from "express";
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  getUserById,
  followUser,
  getFollowings,
  getFollowers,
  searchUsers,
} from "../controllers/userControllers";
import authenticateAndAuthorize from "../middleware/authenticateAndAuthorize";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * prefixnya user
router.get("/", authenticateAndAuthorize(["Admin"]), getUsers);
router
  .route("/profile")
  .get(authenticateAndAuthorize(["User", "Admin"]), getUserProfile)
  .patch(
    authenticateAndAuthorize(["User", "Admin"]),
    upload.single("profilePict"),
    uploadToFirebase,
    updateUserProfile
  );
router.get("/following", authenticateAndAuthorize(["User", "Admin"]), getFollowings);
router.get("/followers", authenticateAndAuthorize(["User", "Admin"]), getFollowers);
router.patch("/follow/:userId", authenticateAndAuthorize(["User", "Admin"]), followUser); // * Undo and redo

// * No auth
router.get("/search", searchUsers);
router.get("/:userId", getUserById);

export default router;

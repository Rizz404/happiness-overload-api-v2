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
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";

const router = express.Router();

// * prefixnya user
router.get("/", verifyJwtAndRoles(["Admin"]), getUsers);
router
  .route("/profile")
  .get(verifyJwtAndRoles(), getUserProfile)
  .patch(verifyJwtAndRoles(), upload.single("profilePict"), uploadToFirebase, updateUserProfile);
router.get("/following", verifyJwtAndRoles(), getFollowings);
router.get("/followers", verifyJwtAndRoles(), getFollowers);
router.patch("/follow/:userId", verifyJwtAndRoles(), followUser); // * Undo and redo

// * No auth
router.get("/search", searchUsers);
router.get("/:userId", getUserById);

export default router;

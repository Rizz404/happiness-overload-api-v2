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
  updatePassword,
} from "../controllers/userControllers";
import { auth, optionalAuth } from "../middleware/authentication";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

// * prefixnya user
// * Higher verifyJwtAndRoles itu harus pakai argument jadi auth karena Higher Order Function
router.get("/", auth, allowedRoles(["Admin"]), getUsers);
router.patch("/update-password", auth, updatePassword);
router
  .route("/profile")
  .get(auth, getUserProfile)
  .patch(auth, upload.single("profilePict"), uploadToFirebase, updateUserProfile);
router.get("/following", auth, getFollowings);
router.get("/followers", auth, getFollowers);
router.patch("/follow/:userId", auth, followUser); // * Undo and redo

// * No auth
router.get("/search", searchUsers);
router.get("/:userId", getUserById);

export default router;

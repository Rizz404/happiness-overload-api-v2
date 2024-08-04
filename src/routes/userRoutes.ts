import express from "express";
import {
  getUsers,
  getUserProfile,
  updateUserProfile,
  getUserById,
  followUser,
  getFollowings,
  getFollowers,
  searchUserByUsername,
  updatePassword,
} from "../controllers/userControllers";
import { auth, optionalAuth } from "../middleware/authentication";
import { uploadToFirebase, upload } from "../middleware/firebaseStorageConfig";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

// * prefixnya /users
router.get("/", auth, allowedRoles(["Admin"]), getUsers); // * Bisa menambahkan query page dan limit
router.patch("/update-password", auth, updatePassword);
router
  .route("/profile")
  .get(auth, getUserProfile)
  .patch(
    auth,
    upload.single("profilePict"),
    uploadToFirebase,
    updateUserProfile
  );
router.get("/following", auth, getFollowings); // * Bisa menambahkan query page dan limit
router.get("/followers", auth, getFollowers); // * Bisa menambahkan query page dan limit
router.patch("/follow/:userId", auth, followUser); // * Undo and redo
router.get("/search", searchUserByUsername); // * Bisa menambahkan query page dan limit
router.get("/:userId", getUserById);

export default router;

import express from "express";
import { auth, optionalAuth } from "../middleware/authentication";
import {
  createInterest,
  getInterest,
  getInterests,
  updateInterest,
} from "../controllers/interestControllers";
import { upload, uploadToFirebase } from "../middleware/firebaseStorageConfig";
import allowedRoles from "../middleware/allowedRoles";

const router = express.Router();

router
  .route("/")
  .post(auth, upload.single("image"), uploadToFirebase, createInterest)
  .get(getInterests);
router
  .route("/:interestId")
  .get(getInterest)
  .patch(auth, allowedRoles(["Admin"]), upload.single("image"), uploadToFirebase, updateInterest);

export default router;

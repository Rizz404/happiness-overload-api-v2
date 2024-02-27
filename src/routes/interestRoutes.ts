import express from "express";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";
import {
  createInterest,
  getInterest,
  getInterests,
  updateInterest,
} from "../controllers/interestControllers";
import { upload, uploadToFirebase } from "../middleware/firebaseStorageConfig";

const router = express.Router();

router
  .route("/")
  .post(verifyJwtAndRoles(), upload.single("image"), uploadToFirebase, createInterest)
  .get(getInterests);
router
  .route("/:interestId")
  .get(getInterest)
  .patch(verifyJwtAndRoles(["Admin"]), upload.single("image"), uploadToFirebase, updateInterest);

export default router;

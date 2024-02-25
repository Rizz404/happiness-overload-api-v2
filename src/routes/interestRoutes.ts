import express from "express";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";
import {
  createInterest,
  getInterest,
  getInterests,
  updateInterest,
} from "../controllers/interestControllers";

const router = express.Router();

router.route("/").post(verifyJwtAndRoles(), createInterest).get(getInterests);
router
  .route("/:interestId")
  .get(getInterest)
  .patch(verifyJwtAndRoles(["Admin"]), updateInterest);

export default router;

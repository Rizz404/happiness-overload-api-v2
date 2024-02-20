import { Router } from "express";
import verifyJwtAndRoles from "../middleware/verifyJwtAndRoles";

const router = Router();

// router.get("/random-user", verifyJwtAndRoles(["Admin"]), getRandomUser);

export default router;

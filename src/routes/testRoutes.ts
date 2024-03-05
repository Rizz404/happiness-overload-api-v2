import { Router } from "express";
import { deleteUser, getTwoRandomBot } from "../controllers/testControllers";

const router = Router();

router.get("/users/random-user", getTwoRandomBot);
router.delete("/users/:username", deleteUser);

export default router;

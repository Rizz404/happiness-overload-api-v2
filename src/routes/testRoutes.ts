import { Router } from "express";
import { deleteUser, getRandomBot } from "../controllers/testControllers";

const router = Router();

router.get("/users/random-user", getRandomBot);
router.delete("/users/:username", deleteUser);

export default router;

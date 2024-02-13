import { Router } from "express";
import { deleteUser } from "../controllers/testControllers";

const router = Router();

router.delete("/users/:username", deleteUser);

export default router;

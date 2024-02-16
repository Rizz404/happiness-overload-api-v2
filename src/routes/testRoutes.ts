import { Router } from "express";
import { deleteUser, getRandomBot } from "../controllers/testControllers";

const router = Router();

router.use("/users");
router.get("/random-user", getRandomBot);
router.delete("/:username", deleteUser);

export default router;

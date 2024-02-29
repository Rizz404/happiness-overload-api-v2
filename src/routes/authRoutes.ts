import express from "express";
import { register, login, logout, loginWithGoogle } from "../controllers/authControllers";

const router = express.Router();

// * Prefix /auth
router.post("/google-login", loginWithGoogle);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;

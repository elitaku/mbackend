import express from "express";
import { getMyProfile, login, logOut, signup } from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/new", signup);
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logOut);

export default router;
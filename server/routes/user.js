import express from "express";
import { login, signup } from "../controllers/user.js";

const router = express.Router();

router.post("/login", login);
router.post("/new", signup)

export default router;
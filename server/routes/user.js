import express from "express";
import { getMyProfile } from "../controllers/user.js";

const router = express.Router();

router.get("/me", getMyProfile);


export default router;
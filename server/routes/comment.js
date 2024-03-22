import express from "express";
import { getAllComments, addComment } from "../controllers/comment.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// API endpoints
router.get("/all", getAllComments);
router.post("/create", isAuthenticated, addComment);

export default router;

import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { createOrder } from "../controllers/order.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder)

export default router;
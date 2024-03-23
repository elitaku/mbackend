import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  createOrder,
  getAdminOrders,
  getMyOrders,
  getOrderDetails,
  proccessOrder,
  processPayment,
  getOrdersCountByDay,
  getOrderedProductsCountByCategory,
  getOrdersSumByMonth,
} from "../controllers/order.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.get("/my", isAuthenticated, getMyOrders);
router.post("/payment", isAuthenticated, processPayment);
router.get("/admin", isAuthenticated, isAdmin, getAdminOrders);
router.get("/Orders-per-week", isAuthenticated, getOrdersCountByDay); //not really order per week. more like products that are ordered at the current date
router.get("/Orders-per-Product-Category", isAuthenticated, getOrderedProductsCountByCategory);
router.get("/Orders-per-month", isAuthenticated, getOrdersSumByMonth);

router
  .route("/single/:id")
  .get(isAuthenticated, getOrderDetails)
  .put(isAuthenticated, isAdmin, proccessOrder);

export default router;

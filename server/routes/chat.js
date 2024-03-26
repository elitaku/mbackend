import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  getAllUsers,
  sendContactRequest,
  getContactRequest,
  acceptContactRequest,
  getAllContacts,
  sendMessage,
  getUserDetails,
  getChatRoomDetails
} from "../controllers/chat.js";

const router = express.Router();

router.get("/users", isAuthenticated, getAllUsers);
router.get("/contact-request", isAuthenticated, getContactRequest);
router.get("/accepted-contacts", isAuthenticated, getAllContacts);
router.get("/user/:userId", isAuthenticated, getUserDetails);
router.get("/messages/:senderId/:recepientId", isAuthenticated, getChatRoomDetails)

router.post("/contact-request", isAuthenticated, sendContactRequest);
router.post("/contact-request/accept", isAuthenticated, acceptContactRequest);
router.post("/messages", isAuthenticated, sendMessage)

export default router;

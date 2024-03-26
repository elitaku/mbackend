import express from "express";
import {
  changePassword,
  deleteUser,
  forgetPassword,
  getMyProfile,
  googleLogin,
  login,
  logOut,
  resetPassword,
  signup,
  updatePic,
  updateProfile,
} from "../controllers/user.js";
import {
  isAdmin,
  isAuthenticated,
  verifyIdToken,
} from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/login", login);
router.post("/new", singleUpload, signup);
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logOut);
router.post("/verifyidtoken", verifyIdToken, googleLogin);
router.delete("/delete/:id", isAuthenticated, isAdmin, deleteUser);
// Updating Routes
router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/changepassword", isAuthenticated, changePassword);
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);
// router.put("/updatepic", isAuthenticated, singleUpload, updatePic);

//Forget and reset Password
router.route("/forgetpassword").post(forgetPassword).put(resetPassword);

export default router;

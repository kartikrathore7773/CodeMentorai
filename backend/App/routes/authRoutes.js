import express from "express";
import {
  signup,
  login,
  verifyEmail,
  me,
  resendVerification,
  checkEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  googleAuth,
} from "../controllers/web/authController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", me); // 🔥 YE LINE MISS THI
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/check-email", checkEmail);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/change-password", authMiddleware, changePassword);
router.post("/logout", logout);

export default router;

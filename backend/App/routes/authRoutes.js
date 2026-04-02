import express from "express";
import { sendEmail } from "../utils/sendEmail.js";
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
router.post("/test-email", async (req, res) => {
  try {
    const result = await sendEmail({
      to: req.body.email || "kartikrathore770@gmail.com",
      subject: "Test Email from CodeMentor AI",
      html: `<h1>Test Email</h1><p>Sent at: ${new Date().toISOString()}</p><p>CLIENT_URL: ${process.env.CLIENT_URL}</p>`,
    });
    res.json({ success: true, message: "Test email sent", result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/change-password", authMiddleware, changePassword);
router.post("/logout", logout);

export default router;

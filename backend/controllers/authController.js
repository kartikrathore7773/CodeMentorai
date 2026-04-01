import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // 🔒 Do not reveal existence
    return res.json({ message: "If email exists, reset link sent" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password - Your App Name",
      html: `
    <div style="
      max-width:520px;
      margin:40px auto;
      padding:28px;
      font-family:Arial, Helvetica, sans-serif;
      background:#ffffff;
      border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,0.08);
    ">

      <h2 style="
        text-align:center;
        color:#111827;
        margin-bottom:8px;
      ">
        Your App Name<span style="color:#6366f1;">.</span>
      </h2>

      <p style="
        text-align:center;
        color:#6b7280;
        font-size:14px;
        margin-bottom:24px;
      ">
        Build • Learn • Ship faster
      </p>

      <p style="
        color:#374151;
        font-size:15px;
        line-height:1.6;
        margin-bottom:20px;
      ">
        We received a request to reset your password for your
        <strong>Your App Name</strong> account.
      </p>

      <p style="
        color:#374151;
        font-size:15px;
        line-height:1.6;
        margin-bottom:24px;
      ">
        Click the button below to set a new password:
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${resetUrl}"
          style="
            display:inline-block;
            background:#ef4444;
            color:#ffffff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:6px;
            font-size:15px;
            font-weight:600;
          ">
          Reset Password
        </a>
      </div>

      <p style="
        color:#6b7280;
        font-size:13px;
        line-height:1.6;
      ">
        This password reset link will expire in <strong>15 minutes</strong>.
        If you didn't request a password reset, please ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

      <p style="
        text-align:center;
        color:#9ca3af;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} Your App Name
      </p>
    </div>
  `,
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
    // Don't reveal email sending failure for security reasons
  }

  res.json({ message: "Password reset link sent" });
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};

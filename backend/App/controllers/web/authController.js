import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

/**
 * ===============================
 * SIGNUP + EMAIL VERIFICATION
 * ===============================
 */
export const signup = async (req, res) => {
  try {
    console.log("SIGNUP REQ BODY ->", JSON.stringify(req.body));
    const { name, email, password, role, adminSecret } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // 🔒 Admin creation protection
    let finalRole = "user";
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin secret",
        });
      }
      finalRole = "admin";
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please login instead.",
      });
    }

    // 🔐 Email verify token
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      emailVerifyToken,
      isEmailVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
    // 📧 EMAIL BACKGROUND ME BHEJO
    try {
      const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email/${emailVerifyToken}`;
      console.log("📧 Sending verification email to:", user.email);
      console.log("📧 Verification URL:", verifyUrl);

      await sendEmail({
        to: user.email,
        subject: "Verify your email - CodeMentor AI",
        to: user.email,
        subject: "Verify your email - CodeMentor AI",
        html: `
  <div style="
    max-width:600px;
    margin:40px auto;
    padding:32px;
    background:#ffffff;
    border-radius:12px;
    font-family:Arial,Helvetica,sans-serif;
    box-shadow:0 10px 30px rgba(0,0,0,0.08);
  ">
    
    <h1 style="
      text-align:center;
      font-size:28px;
      margin-bottom:10px;
      color:#111827;
    ">
      CodeMentor AI<span style="color:#6366f1;">.</span>
    </h1>

    <p style="
      text-align:center;
      font-size:15px;
      color:#6b7280;
      margin-bottom:30px;
    ">
      Build • Learn • Ship faster
    </p>

    <h2 style="
      font-size:20px;
      color:#111827;
      margin-bottom:12px;
    ">
      Welcome to CodeMentor AI 👋
    </h2>

    <p style="
      font-size:15px;
      color:#374151;
      line-height:1.6;
      margin-bottom:24px;
    ">
      Thanks for creating an account. Please confirm your email address by clicking the button below.
    </p>

    <div style="text-align:center; margin:32px 0;">
      <a href="${verifyUrl}" 
        style="
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#ffffff;
          text-decoration:none;
          padding:14px 28px;
          font-size:16px;
          font-weight:600;
          border-radius:8px;
          display:inline-block;
        ">
        Verify Email
      </a>
    </div>

    <p style="
      font-size:14px;
      color:#6b7280;
      line-height:1.6;
      margin-top:24px;
    ">
      If you didn’t create a CodeMentor AI account, you can safely ignore this email.
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

    <p style="
      font-size:13px;
      color:#9ca3af;
      text-align:center;
    ">
      © ${new Date().getFullYear()} CodeMentor AI. All rights reserved.
    </p>
  </div>
  `,
      });
      console.log("✅ Verification email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ EMAIL ERROR during signup 👉", emailError.message);
      console.error("❌ Full email error:", emailError);
      // Don't fail signup if email fails, but log it
    }
  } catch (error) {
    console.error(
      "SIGNUP ERROR 👉",
      error && error.stack ? error.stack : error,
    );

    // Handle common Mongo duplicate key error (e.g., unique index violation)
    if (
      error &&
      (error.name === "MongoServerError" ||
        error.code === 11000 ||
        error.code === "11000")
    ) {
      const key = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please login instead.",
      });
    }

    // include error message in response only for dev
    return res.status(500).json({
      success: false,
      message: "Signup failed",
      error:
        process.env.NODE_ENV !== "production"
          ? String(error.message || error)
          : undefined,
    });
  }
};

/**
 * ===============================
 * VERIFY EMAIL
 * ===============================
 */
export const verifyEmail = async (req, res) => {
  console.log("verifyEmail called with token:", req.params.token);
  const user = await User.findOne({
    emailVerifyToken: req.params.token,
  });
  console.log("verifyEmail - user found:", !!user, user?._id);

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  await user.save();

  res.json({ message: "Email verified successfully" });
};

/**
 * ===============================
 * RESEND VERIFICATION EMAIL
 * ===============================
 */
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = token;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email - CodeMentor AI",
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
        CodeMentor AI<span style="color:#6366f1;">.</span>
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
        Welcome to <strong>CodeMentor AI</strong> 👋  
        <br />
        Please verify your email address to complete your signup.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <a href="${verifyUrl}"
          style="
            display:inline-block;
            background:#6366f1;
            color:#ffffff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:6px;
            font-size:15px;
            font-weight:600;
          ">
          Verify Email
        </a>
      </div>

      <p style="
        color:#6b7280;
        font-size:13px;
        line-height:1.6;
      ">
        If you didn’t create a CodeMentor AI account, you can safely ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

      <p style="
        text-align:center;
        color:#9ca3af;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} CodeMentor AI
      </p>
    </div>
  `,
  });

  res.json({ message: "Verification email resent" });
};

/**
 * ===============================
 * CHECK EMAIL - SEND VERIFICATION
 * ===============================
 */
export const checkEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.json({
      success: true,
      message:
        "If an account with this email exists, a verification link has been sent.",
    });
  }

  if (user.isEmailVerified) {
    return res.json({
      success: true,
      message: "This email is already verified.",
    });
  }

  // Generate new verification token
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = emailVerifyToken;
  await user.save();

  // Send verification email
  try {
    const verifyUrl = `${process.env.CLIENT_URL}/auth/verify-email/${emailVerifyToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email - CodeMentor AI",
      html: `
<div style="
  max-width:600px;
  margin:40px auto;
  padding:32px;
  background:#ffffff;
  border-radius:12px;
  font-family:Arial,Helvetica,sans-serif;
  box-shadow:0 10px 30px rgba(0,0,0,0.08);
">

  <h1 style="
    text-align:center;
    font-size:28px;
    margin-bottom:10px;
    color:#111827;
  ">
    CodeMentor AI<span style="color:#6366f1;">.</span>
  </h1>

  <p style="
    text-align:center;
    font-size:15px;
    color:#6b7280;
    margin-bottom:30px;
  ">
    Build • Learn • Ship faster
  </p>

  <h2 style="
    font-size:20px;
    color:#111827;
    margin-bottom:12px;
  ">
    Verify Your Email Address
  </h2>

  <p style="
    font-size:15px;
    color:#374151;
    line-height:1.6;
    margin-bottom:24px;
  ">
    Please confirm your email address by clicking the button below to complete your account verification.
  </p>

  <div style="text-align:center; margin:32px 0;">
    <a href="${verifyUrl}"
      style="
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        color:#ffffff;
        text-decoration:none;
        padding:14px 28px;
        font-size:16px;
        font-weight:600;
        border-radius:8px;
        display:inline-block;
      ">
      Verify Email
    </a>
  </div>

  <p style="
    font-size:14px;
    color:#6b7280;
    line-height:1.6;
    margin-top:24px;
  ">
    If you didn't request this verification, you can safely ignore this email.
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

  <p style="
    font-size:13px;
    color:#9ca3af;
    text-align:center;
  ">
    © ${new Date().getFullYear()} CodeMentor AI. All rights reserved.
  </p>
</div>
`,
    });

    res.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (emailError) {
    console.error("EMAIL ERROR 👉", emailError.message);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email. Please try again later.",
    });
  }
};

/**
 * ===============================
 * LOGIN
 * ===============================
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if user is deleted/banned
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated. Please contact support if you believe this is an error.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // ✅ DEPLOY-SAFE COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token, // Include token for frontend localStorage
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/**
 * ===============================
 * FORGOT PASSWORD
 * ===============================
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

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password - CodeMentor AI",
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
        CodeMentor AI<span style="color:#6366f1;">.</span>
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
        <strong>CodeMentor AI</strong> account.
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
        If you didn’t request a password reset, please ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

      <p style="
        text-align:center;
        color:#9ca3af;
        font-size:12px;
      ">
        © ${new Date().getFullYear()} CodeMentor AI
      </p>
    </div>
  `,
    });

    res.json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Forgot password email error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send reset email. Please try again later." });
  }
};

/**
 * ===============================
 * RESET PASSWORD
 * ===============================
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

/**
 * ===============================
 * CHANGE PASSWORD (LOGGED IN)
 * ===============================
 */
export const changePassword = async (req, res) => {
  const user = await User.findById(req.user.id);

  const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Old password incorrect" });
  }

  user.password = req.body.newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
};

export const me = async (req, res) => {
  try {
    let token = req.cookies.token; // 👈 cookie se check karo

    // If no cookie token, check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logout successful",
  });
};

/**
 * ===============================
 * GOOGLE AUTH
 * ===============================
 */
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Check if user was previously deleted/banned
      if (user.isDeleted) {
        return res.status(403).json({
          success: false,
          message:
            "This account has been deactivated. Please contact support if you believe this is an error.",
        });
      }

      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        profilePicture: picture,
        isEmailVerified: true, // Google accounts are pre-verified
        role: "user",
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // ✅ DEPLOY-SAFE COOKIE
    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

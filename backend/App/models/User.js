import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for Google auth
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    // 🔐 Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,

    // Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
    },

    // Account status
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    walletBalance: {
      type: Number,
      default: 0,
    },
    // 🔐 Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // 💳 PAID COURSES / NOTES (NEW)
    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true },
);

/**
 * ⚠️ IMPORTANT
 * - DO NOT use arrow function
 * - DO NOT change function signature
 */
userSchema.pre("save", async function () {
  // Referral code generation: ensure no empty-string referralCode is stored
  if (!this.referralCode || this.referralCode === "") {
    // generate a short hex code and ensure uniqueness
    let code;
    // loop until unique (should be fast for short userbases)
    do {
      code = crypto.randomBytes(3).toString("hex"); // 6 chars
    } while (await mongoose.models.User.findOne({ referralCode: code }));
    this.referralCode = code;
  }

  // Password hashing
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
});

export default mongoose.model("User", userSchema);

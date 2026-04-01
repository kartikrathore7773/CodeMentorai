// Test script for forgot password functionality
import mongoose from "mongoose";
import { forgotPassword } from "./App/controllers/web/authController.js";
import User from "./App/models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Mock request/response for testing
const mockReq = {
  body: { email: "test@example.com" },
};

const mockRes = {
  json: (data) => {
    console.log("Response:", data);
    return mockRes;
  },
  status: (code) => {
    console.log("Status:", code);
    return mockRes;
  },
};

async function testForgotPassword() {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Create a test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "testpassword123",
    });

    console.log("Test user created:", testUser.email);

    // Test forgot password
    console.log("Testing forgot password...");
    await forgotPassword(mockReq, mockRes);

    // Check if token was set
    const updatedUser = await User.findById(testUser._id);
    console.log("Token set:", !!updatedUser.resetPasswordToken);
    console.log("Token expires:", updatedUser.resetPasswordExpire);

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    await mongoose.disconnect();

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testForgotPassword();

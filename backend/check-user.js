import mongoose from "mongoose";
import User from "./App/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: "kartikrathore770@gmail.com" });
    if (user) {
      console.log("User found:", user.email);
      console.log("User ID:", user._id);
    } else {
      console.log("User not found, creating test user...");

      const testUser = await User.create({
        name: "Test User",
        email: "kartikrathore770@gmail.com",
        password: "testpassword123",
      });

      console.log("Test user created:", testUser.email);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUser();

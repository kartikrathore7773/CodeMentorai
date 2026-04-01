import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./App/models/User.js";

dotenv.config();

const token = process.argv[2];
if (!token) {
  console.error("Usage: node checkToken.js <token>");
  process.exit(1);
}

(async () => {
  try {
    console.log("checkToken: connecting to", process.env.MONGO_URI);
    mongoose.set("strictQuery", false);
    mongoose.set("debug", true);
    mongoose.connection.on("connected", () =>
      console.log("checkToken: mongoose connected"),
    );
    mongoose.connection.on("error", (e) =>
      console.error("checkToken: mongoose connection error", e),
    );
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(
      "checkToken: connection readyState=",
      mongoose.connection.readyState,
    );
    let user;
    try {
      user = await User.findOne({ emailVerifyToken: token }).lean();
    } catch (opErr) {
      console.error("checkToken: findOne error:", opErr);
      throw opErr;
    }
    if (!user) {
      console.log("No user found with that token.");
    } else {
      console.log("User found:");
      console.log({
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        emailVerifyToken: user.emailVerifyToken,
      });
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(2);
  }
})();

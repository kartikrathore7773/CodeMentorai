import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../App/models/User.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codementor_ai";

async function run() {
  console.log("Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI, { dbName: "codementor_ai" });

  try {
    // Find users with empty string referralCode
    const users = await User.find({
      $or: [{ referralCode: "" }, { referralCode: null }],
    });
    console.log(`Found ${users.length} users with empty/null referralCode`);

    for (const user of users) {
      user.referralCode = undefined; // pre-save hook will generate a new unique code
      await user.save();
      console.log(
        `Updated user ${user._id} -> referralCode: ${user.referralCode}`,
      );
    }

    console.log("Sanitization complete.");
  } catch (err) {
    console.error("Sanitization failed:", err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected. Done.");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

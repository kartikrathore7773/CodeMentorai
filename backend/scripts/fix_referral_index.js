import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codementor_ai";

async function run() {
  console.log("Connecting to MongoDB:", MONGO_URI);
  await mongoose.connect(MONGO_URI, { dbName: "codementor_ai" });

  const db = mongoose.connection.db;
  const collName = "users";

  try {
    const coll = db.collection(collName);
    // Try dropping the existing index if it exists
    try {
      console.log("Attempting to drop index 'referralCode_1' if it exists...");
      await coll.dropIndex("referralCode_1");
      console.log("Dropped index referralCode_1");
    } catch (err) {
      if (
        err.codeName === "IndexNotFound" ||
        /index not found/i.test(err.message)
      ) {
        console.log("Index referralCode_1 not found, continuing...");
      } else {
        console.warn("Warning while dropping index:", err.message);
      }
    }

    // Create the sparse unique index
    console.log("Creating sparse unique index on referralCode...");
    await coll.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
    console.log("Created sparse unique index on referralCode.");
  } catch (err) {
    console.error("Migration failed:", err);
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

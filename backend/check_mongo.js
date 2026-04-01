const { MongoClient } = require("mongodb");

async function main() {
  const uri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codementor_ai";
  console.log("check_mongo: testing connection to", uri);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log("check_mongo: connected to MongoDB");

    const admin = client.db().admin();
    const info = await admin.serverStatus();
    console.log("check_mongo: serverStatus ok. host:", info.host);

    const db = client.db();
    const collections = await db.collections();
    console.log(
      "check_mongo: collections:",
      collections.map((c) => c.collectionName),
    );

    // quick test query on users collection
    try {
      const users = db.collection("users");
      const one = await users.findOne({}, { projection: { _id: 1 } });
      console.log(
        "check_mongo: users.findOne result:",
        one ? "found a document" : "no documents",
      );
    } catch (qerr) {
      console.error("check_mongo: query failed", qerr);
    }
  } catch (err) {
    console.error("check_mongo: connection failed", err);
  } finally {
    await client.close();
    console.log("check_mongo: closed");
  }
}

if (require.main === module) main();

module.exports = { main };

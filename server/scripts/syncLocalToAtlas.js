/**
 * Sync / Migrate Script: Local MongoDB -> MongoDB Atlas
 * Usage: node server/scripts/syncLocalToAtlas.js
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const LOCAL_URI = "mongodb://127.0.0.1:27017/cinebook";
const ATLAS_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://Lithish_project:Lithishkumar@cluster0.l8hi8yu.mongodb.net/flickticket?retryWrites=true&w=majority";

async function syncLocalToAtlas() {
  console.log("Connecting to Local MongoDB and Atlas...");
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

  const collections = [
    "movies",
    "shows",
    "users",
    "bookings",
    "snacks",
    "snackorders",
    "parkings",
    "auditlogs",
  ];

  for (const colName of collections) {
    const localCol = localConn.db.collection(colName);
    const atlasCol = atlasConn.db.collection(colName);

    const docs = await localCol.find({}).toArray();
    if (docs.length === 0) continue;

    console.log(`Syncing "${colName}" (${docs.length} records)...`);

    const ops = docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }));

    const res = await atlasCol.bulkWrite(ops);
    console.log(` -> "${colName}": ${res.upsertedCount + res.modifiedCount} synchronized.`);
  }

  console.log("\n✅ All local records successfully mirrored into MongoDB Atlas!");
  process.exit(0);
}

syncLocalToAtlas().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});

// fixVans.js
const mongoose = require("mongoose");

const MONGO_URL = "mongodb+srv://prabhjotkaur_db_user:prabh2544@van-tracker.gzcl6mu.mongodb.net/van-tracker?retryWrites=true&w=majority";

const VanSchema = new mongoose.Schema({
  vanID: { type: String, required: true, unique: true },
  driverNumber: String,
  driverName: String
});

const Van = mongoose.model("Van", VanSchema, "vans");

(async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Clear old malformed data
    await Van.deleteMany({});
    console.log("🗑️  Old van data cleared");

    // Insert new correct data
    const vans = [
      { vanID: "VAN001", driverNumber: "7986031171", driverName: "prabh" },
      { vanID: "VAN002", driverNumber: "7986465185", driverName: "sukhman" }
    ];

    await Van.insertMany(vans);
    console.log("🚐 Vans inserted successfully:", vans);

    await mongoose.disconnect();
    console.log("✅ Done and disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();

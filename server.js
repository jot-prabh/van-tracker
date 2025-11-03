// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CONFIG ----------
const MONGO_URL = "process.env.MONGO_URL";

// Replace <user>, <pass>, cluster0.xxxxx with your Atlas values or set env var MONGO_URL

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // put driver.html & dashboard.html & style.css under public/

// ---------- MONGOOSE ----------

mongoose.connection.on("connected", async () => {
  console.log("✅ Connected to DB:", mongoose.connection.name);

  // Wait for DB object to become ready
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📦 Collections found in this DB:", collections.map(c => c.name));
  } else {
    console.log("⚠️ Database object not yet ready.");
  }
});


console.log("Connected host:", mongoose.connection.host);

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const VanSchema = new mongoose.Schema({
  vanID: { type: String, required: true, unique: true },
  driverNumber: String,
  driverName: String
});

const Van = mongoose.model("Van", VanSchema, "vans");


const LocationSchema = new mongoose.Schema({
  vanID: { type: String, required: true, unique: true },
  lat: Number,
  lon: Number,
  updated: { type: Date, default: Date.now }
});
const Location = mongoose.model("Location", LocationSchema, "locations");

// ---------- ROUTES ----------

// Return list of vanIDs (for dropdowns)
app.get("/api/allowedVans", async (req, res) => {
  try {
    const vans = await Van.find({}, "vanID").lean();
    console.log("Fetched Vans from MongoDB:", vans); // <-- must be here
    res.json(vans.map(v => v.vanID));
  } catch (err) {
    console.error("Error fetching vans:", err);
    res.status(500).json({ error: err.message });
  }
});


// Add a van (useful for API seed or Postman)
app.post("/api/addVan", async (req, res) => {
  try {
    const { vanID, driverNumber, driverName } = req.body;
    if (!vanID) return res.status(400).json({ error: "vanID required" });
    const van = new Van({ vanID, driverNumber, driverName });
    await van.save();
    res.json({ message: "Van added successfully" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "vanID already exists" });
    res.status(500).json({ error: err.message });
  }
});

// Driver posts GPS location -> upsert into locations collection
app.post("/api/locations", async (req, res) => {
  try {
    const { vanID, lat, lon } = req.body;
    if (!vanID || typeof lat !== "number" || typeof lon !== "number") {
      return res.status(400).json({ error: "vanID, lat, lon required" });
    }

    // Verify van exists (optional)
    const van = await Van.findOne({ vanID });
    if (!van) return res.status(403).json({ error: "Van not registered" });

    await Location.findOneAndUpdate(
      { vanID },
      { vanID, lat, lon, updated: new Date() },
      { upsert: true, new: true }
    );

    console.log(`📍 ${new Date().toLocaleTimeString()} | ${vanID} → ${lat}, ${lon}`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Students request all current locations
app.get("/api/locations", async (req, res) => {
  try {
    const rows = await Location.find({}).lean();
    // older frontend expects object: { VAN001: { lat, lon }, ... }
    const obj = {};
    rows.forEach(r => obj[r.vanID] = { lat: r.lat, lon: r.lon, updated: r.updated });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});// Debug route to check what data exists in MongoDB
app.get("/debug/vans", async (req, res) => {
  try {
    const docs = await mongoose.connection.db.collection("vans").find({}).toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
